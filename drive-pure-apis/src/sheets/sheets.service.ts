import { Injectable } from '@nestjs/common';
import { GoogleService } from '../google/google.service';
import { ApiKeyData } from '../auth/auth.service';

@Injectable()
export class SheetsService {
  constructor(private googleService: GoogleService) {}

  /**
   * Create a new Google Sheet
   */
  async createSheet(
    apiKeyData: ApiKeyData,
    title: string,
    sheetNames?: string[],
    parentFolderId?: string,
  ) {
    const sheets = await this.googleService.getSheetsClient(apiKeyData);
    const drive = await this.googleService.getDriveClient(apiKeyData);

    const requestBody: any = {
      properties: {
        title,
      },
    };

    if (sheetNames && sheetNames.length > 0) {
      requestBody.sheets = sheetNames.map((name) => ({
        properties: {
          title: name,
        },
      }));
    }

    const response = await sheets.spreadsheets.create({
      requestBody,
    });

    const spreadsheetId = response.data.spreadsheetId!;

    // Move to parent folder if specified
    if (parentFolderId) {
      await drive.files.update({
        fileId: spreadsheetId,
        addParents: parentFolderId,
        fields: 'id, parents',
      });
    }

    return {
      spreadsheetId,
      title,
      url: response.data.spreadsheetUrl,
    };
  }

  /**
   * Update cells in a Google Sheet
   */
  async updateSheet(
    apiKeyData: ApiKeyData,
    spreadsheetId: string,
    sheetName: string,
    range: string,
    values: any[][],
  ) {
    const sheets = await this.googleService.getSheetsClient(apiKeyData);

    const fullRange = `${sheetName}!${range}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: fullRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    return {
      spreadsheetId,
      updatedRange: fullRange,
      updatedRows: values.length,
      updatedColumns: values[0]?.length || 0,
    };
  }

  /**
   * Get Google Sheet content
   */
  async getSheetContent(apiKeyData: ApiKeyData, spreadsheetId: string, sheetName?: string) {
    const sheets = await this.googleService.getSheetsClient(apiKeyData);

    const range = sheetName || 'Sheet1';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return {
      spreadsheetId,
      range: response.data.range,
      values: response.data.values || [],
    };
  }

  /**
   * Format cells (background, alignment, wrap)
   */
  async formatCells(
    apiKeyData: ApiKeyData,
    spreadsheetId: string,
    sheetName: string,
    range: string,
    formatting: any,
  ) {
    const sheets = await this.googleService.getSheetsClient(apiKeyData);

    // Get sheet ID from name
    const sheetId = await this.getSheetIdByName(apiKeyData, spreadsheetId, sheetName);

    // Parse range
    const gridRange = this.parseA1Notation(range, sheetId);

    const cellFormat: any = {};
    const fields: string[] = [];

    if (formatting.backgroundColor) {
      cellFormat.backgroundColor = formatting.backgroundColor;
      fields.push('backgroundColor');
    }
    if (formatting.horizontalAlignment) {
      cellFormat.horizontalAlignment = formatting.horizontalAlignment;
      fields.push('horizontalAlignment');
    }
    if (formatting.verticalAlignment) {
      cellFormat.verticalAlignment = formatting.verticalAlignment;
      fields.push('verticalAlignment');
    }
    if (formatting.wrapStrategy) {
      cellFormat.wrapStrategy = formatting.wrapStrategy;
      fields.push('wrapStrategy');
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: gridRange,
              cell: {
                userEnteredFormat: cellFormat,
              },
              fields: `userEnteredFormat(${fields.join(',')})`,
            },
          },
        ],
      },
    });

    return {
      spreadsheetId,
      message: 'Cells formatted successfully',
    };
  }

  /**
   * Format text in cells
   */
  async formatTextInCells(
    apiKeyData: ApiKeyData,
    spreadsheetId: string,
    sheetName: string,
    range: string,
    formatting: any,
  ) {
    const sheets = await this.googleService.getSheetsClient(apiKeyData);
    const sheetId = await this.getSheetIdByName(apiKeyData, spreadsheetId, sheetName);
    const gridRange = this.parseA1Notation(range, sheetId);

    const textFormat: any = {};
    const fields: string[] = [];

    if (formatting.bold !== undefined) {
      textFormat.bold = formatting.bold;
      fields.push('bold');
    }
    if (formatting.italic !== undefined) {
      textFormat.italic = formatting.italic;
      fields.push('italic');
    }
    if (formatting.fontSize !== undefined) {
      textFormat.fontSize = formatting.fontSize;
      fields.push('fontSize');
    }
    if (formatting.fontFamily !== undefined) {
      textFormat.fontFamily = formatting.fontFamily;
      fields.push('fontFamily');
    }
    if (formatting.foregroundColor !== undefined) {
      textFormat.foregroundColor = formatting.foregroundColor;
      fields.push('foregroundColor');
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: gridRange,
              cell: {
                userEnteredFormat: {
                  textFormat,
                },
              },
              fields: `userEnteredFormat.textFormat(${fields.join(',')})`,
            },
          },
        ],
      },
    });

    return {
      spreadsheetId,
      message: 'Text formatted successfully',
    };
  }

  /**
   * Format numbers/dates
   */
  async formatNumbers(
    apiKeyData: ApiKeyData,
    spreadsheetId: string,
    sheetName: string,
    range: string,
    formatType: string,
    pattern?: string,
  ) {
    const sheets = await this.googleService.getSheetsClient(apiKeyData);
    const sheetId = await this.getSheetIdByName(apiKeyData, spreadsheetId, sheetName);
    const gridRange = this.parseA1Notation(range, sheetId);

    const numberFormat: any = {
      type: formatType,
    };

    if (pattern) {
      numberFormat.pattern = pattern;
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: gridRange,
              cell: {
                userEnteredFormat: {
                  numberFormat,
                },
              },
              fields: 'userEnteredFormat.numberFormat',
            },
          },
        ],
      },
    });

    return {
      spreadsheetId,
      message: 'Number format applied successfully',
    };
  }

  /**
   * Set cell borders
   */
  async setBorders(
    apiKeyData: ApiKeyData,
    spreadsheetId: string,
    sheetName: string,
    range: string,
    style: string,
    color: any,
    sides: { top?: boolean; bottom?: boolean; left?: boolean; right?: boolean },
  ) {
    const sheets = await this.googleService.getSheetsClient(apiKeyData);
    const sheetId = await this.getSheetIdByName(apiKeyData, spreadsheetId, sheetName);
    const gridRange = this.parseA1Notation(range, sheetId);

    const border: any = {
      style: style || 'SOLID',
      color: color || { red: 0, green: 0, blue: 0 },
    };

    const updateBordersRequest: any = {
      range: gridRange,
    };

    if (sides.top !== false) updateBordersRequest.top = border;
    if (sides.bottom !== false) updateBordersRequest.bottom = border;
    if (sides.left !== false) updateBordersRequest.left = border;
    if (sides.right !== false) updateBordersRequest.right = border;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            updateBorders: updateBordersRequest,
          },
        ],
      },
    });

    return {
      spreadsheetId,
      message: 'Borders applied successfully',
    };
  }

  /**
   * Merge cells
   */
  async mergeCells(
    apiKeyData: ApiKeyData,
    spreadsheetId: string,
    sheetName: string,
    range: string,
    mergeType = 'MERGE_ALL',
  ) {
    const sheets = await this.googleService.getSheetsClient(apiKeyData);
    const sheetId = await this.getSheetIdByName(apiKeyData, spreadsheetId, sheetName);
    const gridRange = this.parseA1Notation(range, sheetId);

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            mergeCells: {
              range: gridRange,
              mergeType,
            },
          },
        ],
      },
    });

    return {
      spreadsheetId,
      message: 'Cells merged successfully',
    };
  }

  /**
   * Add conditional formatting
   */
  async addConditionalFormat(
    apiKeyData: ApiKeyData,
    spreadsheetId: string,
    sheetName: string,
    range: string,
    conditionType: string,
    values: any[],
    backgroundColor?: any,
    foregroundColor?: any,
  ) {
    const sheets = await this.googleService.getSheetsClient(apiKeyData);
    const sheetId = await this.getSheetIdByName(apiKeyData, spreadsheetId, sheetName);
    const gridRange = this.parseA1Notation(range, sheetId);

    const format: any = {};
    if (backgroundColor) format.backgroundColor = backgroundColor;
    if (foregroundColor) format.textFormat = { foregroundColor };

    const booleanCondition: any = {
      type: conditionType,
      values: values.map((v) => ({ userEnteredValue: String(v) })),
    };

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addConditionalFormatRule: {
              rule: {
                ranges: [gridRange],
                booleanRule: {
                  condition: booleanCondition,
                  format,
                },
              },
              index: 0,
            },
          },
        ],
      },
    });

    return {
      spreadsheetId,
      message: 'Conditional formatting added successfully',
    };
  }

  /**
   * Helper: Get sheet ID by name
   */
  private async getSheetIdByName(
    apiKeyData: ApiKeyData,
    spreadsheetId: string,
    sheetName: string,
  ): Promise<number> {
    const sheets = await this.googleService.getSheetsClient(apiKeyData);

    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const sheet = response.data.sheets?.find(
      (s) => s.properties?.title === sheetName || s.properties?.sheetId === parseInt(sheetName),
    );

    if (!sheet || !sheet.properties?.sheetId) {
      throw new Error(`Sheet not found: ${sheetName}`);
    }

    return sheet.properties.sheetId;
  }

  /**
   * Helper: Parse A1 notation to GridRange
   */
  private parseA1Notation(a1Range: string, sheetId: number): any {
    // Simple parser for ranges like "A1:C10"
    const match = a1Range.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);

    if (!match) {
      throw new Error(`Invalid A1 notation: ${a1Range}`);
    }

    const startCol = this.columnToIndex(match[1]);
    const startRow = parseInt(match[2]) - 1;
    const endCol = this.columnToIndex(match[3]) + 1;
    const endRow = parseInt(match[4]);

    return {
      sheetId,
      startRowIndex: startRow,
      endRowIndex: endRow,
      startColumnIndex: startCol,
      endColumnIndex: endCol,
    };
  }

  /**
   * Helper: Convert column letter to index
   */
  private columnToIndex(column: string): number {
    let index = 0;
    for (let i = 0; i < column.length; i++) {
      index = index * 26 + (column.charCodeAt(i) - 64);
    }
    return index - 1;
  }
}

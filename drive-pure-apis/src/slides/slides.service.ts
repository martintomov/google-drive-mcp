import { Injectable } from '@nestjs/common';
import { GoogleService } from '../google/google.service';
import { ApiKeyData } from '../auth/auth.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SlidesService {
  constructor(private googleService: GoogleService) {}

  /**
   * Create a new Google Slides presentation
   */
  async createPresentation(
    apiKeyData: ApiKeyData,
    title: string,
    slideCount = 1,
    parentFolderId?: string,
  ) {
    const slides = await this.googleService.getSlidesClient(apiKeyData);
    const drive = await this.googleService.getDriveClient(apiKeyData);

    const presentation = await slides.presentations.create({
      requestBody: {
        title,
      },
    });

    const presentationId = presentation.data.presentationId!;

    // Add additional blank slides if requested
    if (slideCount > 1) {
      const requests = [];
      for (let i = 1; i < slideCount; i++) {
        requests.push({
          createSlide: {
            insertionIndex: i,
          },
        });
      }

      await slides.presentations.batchUpdate({
        presentationId,
        requestBody: { requests },
      });
    }

    // Move to parent folder if specified
    if (parentFolderId) {
      await drive.files.update({
        fileId: presentationId,
        addParents: parentFolderId,
        fields: 'id, parents',
      });
    }

    return {
      presentationId,
      title,
      url: `https://docs.google.com/presentation/d/${presentationId}/edit`,
    };
  }

  /**
   * Get presentation content
   */
  async getPresentationContent(apiKeyData: ApiKeyData, presentationId: string) {
    const slides = await this.googleService.getSlidesClient(apiKeyData);

    const presentation = await slides.presentations.get({
      presentationId,
    });

    return {
      presentationId,
      title: presentation.data.title,
      slides: presentation.data.slides,
    };
  }

  /**
   * Create a text box on a slide
   */
  async createTextBox(
    apiKeyData: ApiKeyData,
    presentationId: string,
    slideIndex: number,
    text: string,
    x = 914400,
    y = 914400,
    width = 3000000,
    height = 1000000,
  ) {
    const slides = await this.googleService.getSlidesClient(apiKeyData);

    // Get slide ID from index
    const presentation = await slides.presentations.get({ presentationId });
    const slide = presentation.data.slides?.[slideIndex];

    if (!slide || !slide.objectId) {
      throw new Error(`Slide not found at index ${slideIndex}`);
    }

    const textBoxId = `textBox_${uuidv4()}`;

    await slides.presentations.batchUpdate({
      presentationId,
      requestBody: {
        requests: [
          {
            createShape: {
              objectId: textBoxId,
              shapeType: 'TEXT_BOX',
              elementProperties: {
                pageObjectId: slide.objectId,
                size: {
                  width: { magnitude: width, unit: 'EMU' },
                  height: { magnitude: height, unit: 'EMU' },
                },
                transform: {
                  scaleX: 1,
                  scaleY: 1,
                  translateX: x,
                  translateY: y,
                  unit: 'EMU',
                },
              },
            },
          },
          {
            insertText: {
              objectId: textBoxId,
              text,
            },
          },
        ],
      },
    });

    return {
      presentationId,
      textBoxId,
      message: 'Text box created successfully',
    };
  }

  /**
   * Create a shape on a slide
   */
  async createShape(
    apiKeyData: ApiKeyData,
    presentationId: string,
    slideIndex: number,
    shapeType: string,
    x = 914400,
    y = 914400,
    width = 2000000,
    height = 2000000,
  ) {
    const slides = await this.googleService.getSlidesClient(apiKeyData);

    const presentation = await slides.presentations.get({ presentationId });
    const slide = presentation.data.slides?.[slideIndex];

    if (!slide || !slide.objectId) {
      throw new Error(`Slide not found at index ${slideIndex}`);
    }

    const shapeId = `shape_${uuidv4()}`;

    await slides.presentations.batchUpdate({
      presentationId,
      requestBody: {
        requests: [
          {
            createShape: {
              objectId: shapeId,
              shapeType,
              elementProperties: {
                pageObjectId: slide.objectId,
                size: {
                  width: { magnitude: width, unit: 'EMU' },
                  height: { magnitude: height, unit: 'EMU' },
                },
                transform: {
                  scaleX: 1,
                  scaleY: 1,
                  translateX: x,
                  translateY: y,
                  unit: 'EMU',
                },
              },
            },
          },
        ],
      },
    });

    return {
      presentationId,
      shapeId,
      message: 'Shape created successfully',
    };
  }

  /**
   * Format text in a text box or shape
   */
  async formatText(
    apiKeyData: ApiKeyData,
    presentationId: string,
    elementId: string,
    formatting: any,
    startIndex?: number,
    endIndex?: number,
  ) {
    const slides = await this.googleService.getSlidesClient(apiKeyData);

    const textRange: any = { type: 'ALL' };
    if (startIndex !== undefined && endIndex !== undefined) {
      textRange.type = 'FIXED_RANGE';
      textRange.startIndex = startIndex;
      textRange.endIndex = endIndex;
    }

    const style: any = {};
    const fields: string[] = [];

    if (formatting.bold !== undefined) {
      style.bold = formatting.bold;
      fields.push('bold');
    }
    if (formatting.italic !== undefined) {
      style.italic = formatting.italic;
      fields.push('italic');
    }
    if (formatting.fontSize !== undefined) {
      style.fontSize = { magnitude: formatting.fontSize, unit: 'PT' };
      fields.push('fontSize');
    }
    if (formatting.fontFamily !== undefined) {
      style.fontFamily = formatting.fontFamily;
      fields.push('fontFamily');
    }
    if (formatting.foregroundColor !== undefined) {
      style.foregroundColor = {
        opaqueColor: {
          rgbColor: formatting.foregroundColor,
        },
      };
      fields.push('foregroundColor');
    }

    await slides.presentations.batchUpdate({
      presentationId,
      requestBody: {
        requests: [
          {
            updateTextStyle: {
              objectId: elementId,
              textRange,
              style,
              fields: fields.join(','),
            },
          },
        ],
      },
    });

    return {
      presentationId,
      message: 'Text formatted successfully',
    };
  }

  /**
   * Format paragraph (alignment, line spacing, bullets)
   */
  async formatParagraph(
    apiKeyData: ApiKeyData,
    presentationId: string,
    elementId: string,
    formatting: any,
  ) {
    const slides = await this.googleService.getSlidesClient(apiKeyData);

    const requests: any[] = [];

    if (formatting.alignment || formatting.lineSpacing) {
      const style: any = {};
      const fields: string[] = [];

      if (formatting.alignment) {
        style.alignment = formatting.alignment;
        fields.push('alignment');
      }
      if (formatting.lineSpacing) {
        style.lineSpacing = formatting.lineSpacing;
        fields.push('lineSpacing');
      }

      requests.push({
        updateParagraphStyle: {
          objectId: elementId,
          textRange: { type: 'ALL' },
          style,
          fields: fields.join(','),
        },
      });
    }

    if (formatting.bullet !== undefined) {
      requests.push({
        createParagraphBullets: {
          objectId: elementId,
          textRange: { type: 'ALL' },
          bulletPreset: formatting.bullet ? 'BULLET_DISC_CIRCLE_SQUARE' : 'BULLET_NONE',
        },
      });
    }

    if (requests.length > 0) {
      await slides.presentations.batchUpdate({
        presentationId,
        requestBody: { requests },
      });
    }

    return {
      presentationId,
      message: 'Paragraph formatted successfully',
    };
  }

  /**
   * Style a shape (fill color, outline)
   */
  async styleShape(
    apiKeyData: ApiKeyData,
    presentationId: string,
    elementId: string,
    fillColor?: any,
    outlineColor?: any,
    outlineWeight?: number,
  ) {
    const slides = await this.googleService.getSlidesClient(apiKeyData);

    const requests: any[] = [];

    if (fillColor) {
      requests.push({
        updateShapeProperties: {
          objectId: elementId,
          shapeProperties: {
            shapeBackgroundFill: {
              solidFill: {
                color: {
                  rgbColor: fillColor,
                },
              },
            },
          },
          fields: 'shapeBackgroundFill.solidFill.color',
        },
      });
    }

    if (outlineColor || outlineWeight) {
      const outline: any = {};
      const fields: string[] = [];

      if (outlineColor) {
        outline.outlineFill = {
          solidFill: {
            color: {
              rgbColor: outlineColor,
            },
          },
        };
        fields.push('outlineFill.solidFill.color');
      }

      if (outlineWeight !== undefined) {
        outline.weight = { magnitude: outlineWeight, unit: 'EMU' };
        fields.push('weight');
      }

      requests.push({
        updateShapeProperties: {
          objectId: elementId,
          shapeProperties: {
            outline,
          },
          fields: `outline(${fields.join(',')})`,
        },
      });
    }

    if (requests.length > 0) {
      await slides.presentations.batchUpdate({
        presentationId,
        requestBody: { requests },
      });
    }

    return {
      presentationId,
      message: 'Shape styled successfully',
    };
  }

  /**
   * Set slide background color
   */
  async setSlideBackground(
    apiKeyData: ApiKeyData,
    presentationId: string,
    slideIndex: number,
    color: any,
  ) {
    const slides = await this.googleService.getSlidesClient(apiKeyData);

    const presentation = await slides.presentations.get({ presentationId });
    const slide = presentation.data.slides?.[slideIndex];

    if (!slide || !slide.objectId) {
      throw new Error(`Slide not found at index ${slideIndex}`);
    }

    await slides.presentations.batchUpdate({
      presentationId,
      requestBody: {
        requests: [
          {
            updatePageProperties: {
              objectId: slide.objectId,
              pageProperties: {
                pageBackgroundFill: {
                  solidFill: {
                    color: {
                      rgbColor: color,
                    },
                  },
                },
              },
              fields: 'pageBackgroundFill.solidFill.color',
            },
          },
        ],
      },
    });

    return {
      presentationId,
      message: 'Slide background set successfully',
    };
  }
}

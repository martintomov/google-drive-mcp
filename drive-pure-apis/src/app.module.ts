import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { OAuthController } from './oauth.controller';
import { AuthModule } from './auth/auth.module';
import { GoogleModule } from './google/google.module';
import { FilesModule } from './files/files.module';
import { DocsModule } from './docs/docs.module';
import { SheetsModule } from './sheets/sheets.module';
import { SlidesModule } from './slides/slides.module';

@Module({
  imports: [
    AuthModule,
    GoogleModule,
    FilesModule,
    DocsModule,
    SheetsModule,
    SlidesModule,
  ],
  controllers: [AppController, OAuthController],
})
export class AppModule {}

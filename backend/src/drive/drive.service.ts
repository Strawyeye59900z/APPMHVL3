import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { Readable } from 'stream';

@Injectable()
export class DriveService {
  private readonly logger = new Logger(DriveService.name);
  private drive = google.drive({
    version: 'v3',
    auth: new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/drive'],
    }),
  });
  private rootId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!;

  private async findOrCreateFolder(name: string, parentId: string): Promise<string> {
    const res = await this.drive.files.list({
      q: `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id)',
    });
    if (res.data.files?.length) return res.data.files[0].id!;
    const folder = await this.drive.files.create({
      requestBody: {
        name,
        parents: [parentId],
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id',
    });
    return folder.data.id!;
  }

  async uploadResidentPhoto(apartmentNumber: string, fileName: string, buffer: Buffer): Promise<string> {
    const folderId = await this.findOrCreateFolder(apartmentNumber, this.rootId);
    const res = await this.drive.files.create({
      requestBody: { name: fileName, parents: [folderId] },
      media: { mimeType: 'image/jpeg', body: Readable.from(buffer) },
      fields: 'id',
    });
    this.logger.log(`Uploaded ${fileName} to AP ${apartmentNumber}`);
    return res.data.id!;
  }

  async downloadFile(fileId: string): Promise<Buffer> {
    const res = await this.drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' },
    );
    return Buffer.from(res.data as ArrayBuffer);
  }
}

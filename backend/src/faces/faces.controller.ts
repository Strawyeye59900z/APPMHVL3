import {
  Controller,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard, Roles, RolesGuard } from '../auth/jwt-auth.guard';
import { FacesService } from './faces.service';

@Controller('faces')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FacesController {
  constructor(private svc: FacesService) {}

  @Post('residents/:residentId/photo')
  @Roles('RESIDENT')
  @UseInterceptors(FileInterceptor('photo', { limits: { fileSize: 1_048_576 } }))
  upload(
    @Req() req: any,
    @Param('residentId') residentId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.svc.uploadResidentPhoto(req.user.sub, residentId, file);
  }
}

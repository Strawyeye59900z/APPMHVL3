import { Module } from '@nestjs/common';
import { FacialQueueController } from './facial-queue.controller';
import { FacialQueueService } from './facial-queue.service';

@Module({
  controllers: [FacialQueueController],
  providers: [FacialQueueService],
})
export class FacialQueueModule {}

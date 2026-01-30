import { Module } from '@nestjs/common';
import { RegulaService } from './regula.service';

@Module({
  providers: [RegulaService],
  exports: [RegulaService],
})
export class RegulaModule {}


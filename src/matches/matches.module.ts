import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './entities/match.entity';
import { Field } from 'src/locations/entities/field.entity';
import { Schedule } from 'src/locations/entities/schelude.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Match, Field, Schedule])],
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule {}

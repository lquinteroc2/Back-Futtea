import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';

import { Location } from './entities/location.entity';
import { Field } from './entities/field.entity';
import { Schedule } from './entities/schelude.entity';
import { Users } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Location, Field, Schedule, Users]), // importante
  ],
  controllers: [LocationsController],
  providers: [LocationsService],
  exports: [LocationsService,
    TypeOrmModule
  ], // si se usa desde otro módulo
})
export class LocationsModule {}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { CreateFieldDto } from './dto/create-field.dto';
import { CreateScheduleDto } from './dto/create-schelude.dto';
import { Users } from 'src/users/entities/user.entity';
import { UpdateScheduleDto } from './dto/updateSchedule.dto';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  // 🔐 Solo usuarios autenticados
  @UseGuards(AuthGuard)
  @Post()
  createLocation(@Body() dto: CreateLocationDto, @Req() req: Request & { user: Users }) {
    const user = req.user; // viene del JWT
    return this.locationsService.createLocation(dto, user);
  }

  @Get()
  findAllLocations() {
    return this.locationsService.findAllLocations();
  }

  @Get(':id')
  findOneLocation(@Param('id') id: string) {
    return this.locationsService.findOneLocation(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  updateLocation(@Param('id') id: string, @Body() dto: UpdateLocationDto, @Req() req: Request & { user: Users }) {
    const user = req.user;
    return this.locationsService.updateLocation(id, dto, user);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  removeLocation(@Param('id') id: string, @Req() req: Request & { user: Users }) {
    const user = req.user;
    return this.locationsService.removeLocation(id, user);
  }

  // ===========================
  // 🔽 FIELDS
  // ===========================

  @UseGuards(AuthGuard)
  @Post(':locationId/fields')
  createField(
    @Param('locationId') locationId: string,
    @Body() dto: CreateFieldDto,
    @Req() req: Request & { user: Users },
  ) {
    const user = req.user;
    return this.locationsService.createField(locationId, dto, user);
  }

  @Get(':locationId/fields')
  findFieldsByLocation(@Param('locationId') locationId: string) {
    return this.locationsService.findFieldsByLocation(locationId);
  }

  @UseGuards(AuthGuard)
  @Patch('fields/:fieldId')
  updateField(
    @Param('fieldId') fieldId: string,
    @Body() dto: Partial<CreateFieldDto>,
    @Req() req: Request & { user: Users },
  ) {
    return this.locationsService.updateField(fieldId, dto, req.user);
  }

  @UseGuards(AuthGuard)
  @Delete('fields/:fieldId')
  deleteField(
    @Param('fieldId') fieldId: string,
    @Req() req: Request & { user: Users },
  ) {
    return this.locationsService.deleteField(fieldId, req.user);
  }

  


  // ===========================
  // 🔽 SCHEDULES (por cancha)
  // ===========================

  @UseGuards(AuthGuard)
  @Post(':locationId/fields/:fieldId/schedules')
  createSchedule(
    @Param('fieldId') fieldId: string,
    @Body() dto: CreateScheduleDto,
    @Req() req: Request & { user: Users },
  ) {
    const user = req.user;
    return this.locationsService.createSchedule(fieldId, dto, user);
  }

  @Get(':locationId/fields/:fieldId/schedules')
  findSchedulesByField(@Param('fieldId') fieldId: string) {
    return this.locationsService.findSchedulesByField(fieldId);
  }

  @Patch(':locationId/schedules/:scheduleId')
  @UseGuards(AuthGuard)
  async updateSchedule(
    @Param('locationId') locationId: string,
    @Param('scheduleId') scheduleId: string,
    @Body() dto: UpdateScheduleDto,
    @Req() req: Request & { user: Users },
  ) {
    return this.locationsService.updateSchedule(locationId, scheduleId, dto, req.user.uuid);
  }

  @UseGuards(AuthGuard)
  @Delete(':locationId/fields/:fieldId/schedules/:scheduleId')
  deleteSchedule(
    @Param('scheduleId') scheduleId: string,
    @Req() req: Request & { user: Users },
  ) {
    const user = req.user;
    return this.locationsService.deleteSchedule(scheduleId, user);
  }
}

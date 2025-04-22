import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Not, Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { Field } from './entities/field.entity';
import { Schedule } from './entities/schelude.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { CreateFieldDto } from './dto/create-field.dto';
import { Users } from 'src/users/entities/user.entity';
import { CreateScheduleDto } from './dto/create-schelude.dto';
import { UpdateScheduleDto } from './dto/updateSchedule.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private locationRepo: Repository<Location>,

    @InjectRepository(Field)
    private fieldRepo: Repository<Field>,

    @InjectRepository(Schedule)
    private scheduleRepo: Repository<Schedule>,

    @InjectRepository(Users)
    private userRepo: Repository<Users>,
  ) {}

  async createLocation(dto: CreateLocationDto, user: Users) {    
    const fullUser = await this.userRepo.findOne({ where: { uuid: user.uuid } });
    if (!fullUser) throw new NotFoundException('User not found');
  
    const location = this.locationRepo.create({ ...dto, admin: fullUser });
    return this.locationRepo.save(location);
  }

  async findAllLocations() {
    return this.locationRepo.find({ relations: ['fields'] });
  }

  async findOneLocation(id: string) {
    const location = await this.locationRepo.findOne({
      where: { id },
      relations: ['fields'],
    });
    if (!location) throw new NotFoundException('Location not found');
    return location;
  }

  async updateLocation(id: string, dto: UpdateLocationDto, user: Users) {
    const location = await this.locationRepo.findOne({ where: { id }, relations: ['admin'] });
    if (!location) throw new NotFoundException('Location not found');
    if (location.admin.uuid !== user.uuid) throw new ForbiddenException('Not your location');

    Object.assign(location, dto);
    return this.locationRepo.save(location);
  }

  async removeLocation(id: string, user: Users) {
    const location = await this.locationRepo.findOne({ where: { id }, relations: ['admin'] });
    if (!location) throw new NotFoundException('Location not found');
    if (location.admin.uuid !== user.uuid) throw new ForbiddenException('Not your location');

    return this.locationRepo.remove(location);
  }

  // =============== FIELDS ===============

  async createField(locationId: string, dto: CreateFieldDto, user: Users) {
    const location = await this.locationRepo.findOne({ where: { id: locationId }, relations: ['admin'] });
    console.log('Location admin uuid:', location.admin.uuid);
    console.log('Location admin uuid:', location.admin?.uuid);
    console.log('admin:', location.admin);
    console.log('User uuid from token:', user.uuid);
    if (!location) throw new NotFoundException('Location not found');
    if (location.admin.uuid !== user.uuid) throw new ForbiddenException('Not your location');

    const field = this.fieldRepo.create({ ...dto, location });

    return this.fieldRepo.save(field);
  }

  async findFieldsByLocation(locationId: string) {
    return this.fieldRepo.find({
      where: { location: { id: locationId } },
      relations: ['schedules'],
    });
  }


async updateField(fieldId: string, dto: Partial<CreateFieldDto>, user: Users) {
  const field = await this.fieldRepo.findOne({
    where: { id: fieldId },
    relations: ['location', 'location.admin', 'schedules'],
  });

  if (!field) throw new NotFoundException('Field not found');
  if (field.location.admin.uuid !== user.uuid) throw new ForbiddenException('Not your field');

  // Validar si hay reservas activas o futuras
  const now = new Date();
  const futureSchedules = field.schedules.filter(schedule => {
    const startDateTime = new Date(`${schedule.date}T${schedule.startTime}:00`);
    return startDateTime > now;
  });
  if (futureSchedules.length > 0) {
    throw new ForbiddenException('Cannot update field with active or future reservations');
  }

  Object.assign(field, dto);
  return this.fieldRepo.save(field);
}

async deleteField(fieldId: string, user: Users) {
  const field = await this.fieldRepo.findOne({
    where: { id: fieldId },
    relations: ['location', 'location.admin', 'schedules'],
  });

  if (!field) throw new NotFoundException('Field not found');
  if (field.location.admin.uuid !== user.uuid) throw new ForbiddenException('Not your field');

  // Validar si hay reservas futuras
  const now = new Date();
  const futureSchedules = field.schedules.filter(schedule => {
    const startDateTime = new Date(`${schedule.date}T${schedule.startTime}:00`);
    return startDateTime > now;
  });
  if (futureSchedules.length > 0) {
    throw new ForbiddenException('Cannot delete field with future reservations');
  }

  return this.fieldRepo.remove(field);
}

  

  // =============== SCHEDULES ===============

  async createSchedule(fieldId: string, dto: CreateScheduleDto, user: Users) {
    const field = await this.fieldRepo.findOne({
      where: { id: fieldId },
      relations: ['location', 'location.admin'],
    });
  
    if (!field) throw new NotFoundException('Field not found');
    if (field.location.admin.uuid !== user.uuid)
      throw new ForbiddenException('Not your field');
  
    const schedule = this.scheduleRepo.create({
      ...dto,
      isAvailable: dto.isAvailable ?? true,
      field,
    });
  
    return this.scheduleRepo.save(schedule);
  }

  async findSchedulesByField(fieldId: string) {
    return this.scheduleRepo.find({
      where: { field: { id: fieldId } },
    });
  }

  async updateSchedule(
    locationId: string,
    scheduleId: string,
    dto: UpdateScheduleDto,
    userId: string,
  ) {
    // Verifica que el usuario es dueño del location
    const location = await this.locationRepo.findOne({
      where: { id: locationId },
      relations: ['admin'],
    });
  
    if (!location) throw new NotFoundException('Location not found');
    if (location.admin.uuid !== userId) throw new ForbiddenException('Not allowed to edit schedules for this location');
  
    const schedule = await this.scheduleRepo.findOne({
      where: { id: scheduleId },
      relations: ['field', 'field.location', 'field.location.admin'],
    });
    
  
    if (!schedule) throw new NotFoundException('Schedule not found');
  
    await this.scheduleRepo.findOne({
      where: {
        field: {
          location: { id: locationId },
        },
        id: Not(scheduleId),
        startTime: LessThan(dto.endTime),
        endTime: MoreThan(dto.startTime),
      },
      relations: ['field', 'field.location'],
    });
  
    // Actualiza horario
    schedule.startTime = dto.startTime;
    schedule.endTime = dto.endTime;
    return this.scheduleRepo.save(schedule);
  }
  

  async deleteSchedule(scheduleId: string, user: Users) {
    const schedule = await this.scheduleRepo.findOne({
      where: { id: scheduleId },
      relations: ['field', 'field.location', 'field.location.admin'],
    });
  
    if (!schedule) throw new NotFoundException('Schedule not found');
    if (schedule.field.location.admin.uuid !== user.uuid)
      throw new ForbiddenException('Not your schedule');
  
    return this.scheduleRepo.remove(schedule);
  }
}

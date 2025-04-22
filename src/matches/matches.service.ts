import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { Users } from 'src/users/entities/user.entity';
import { Field } from 'src/locations/entities/field.entity';
import { FilterMatchDto } from './dto/filter-match.dto';
import { Schedule } from 'src/locations/entities/schelude.entity';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,

    @InjectRepository(Field)
    private readonly fieldRepo: Repository<Field>,

    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
  ) {}

  private addMinutesToTime(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins + minutes);
  
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  async createMatch(dto: CreateMatchDto, user: Users) {
    const field = await this.fieldRepo.findOne({
      where: { id: dto.location },
    });
    if (!field) throw new NotFoundException('Field not found');
  
    const duration = dto.duration ?? 60; // En minutos, por defecto 1 hora
    const matchStart = dto.time;
    const matchEnd = this.addMinutesToTime(matchStart, duration);
  
    // Buscar conflictos en horarios
    const conflict = await this.scheduleRepo
      .createQueryBuilder('schedule')
      .where('schedule.fieldId = :fieldId', { fieldId: field.id })
      .andWhere('schedule.date = :date', { date: dto.date })
      .andWhere('schedule.isAvailable = false')
      .andWhere(`(
        (schedule.startTime, schedule.endTime) OVERLAPS (:startTime, :endTime)
      )`, {
        startTime: matchStart,
        endTime: matchEnd,
      })
      .getOne();
  
    if (conflict) {
      throw new ForbiddenException('This field is already occupied at that time.');
    }
  
    // Crear el match
    const match = this.matchRepo.create({
      ...dto,
      field,
      creator: user,
      players: [user],
    });
    const savedMatch = await this.matchRepo.save(match);
  
    // Marcar ese bloque como ocupado en la tabla de Schedule
    const newSchedule = this.scheduleRepo.create({
      date: dto.date,
      startTime: matchStart,
      endTime: matchEnd,
      isAvailable: false,
      field,
    });
    await this.scheduleRepo.save(newSchedule);
  
    return savedMatch;
  }
  

  async findAllMatches() {
    return this.matchRepo.find({ relations: ['creator', 'players', 'field'] });
  }

  async getOccupiedSchedules(fieldId: string) {
    return this.scheduleRepo.find({
      where: { field: { id: fieldId }, isAvailable: false },
    });
  }
  

  async filterMatches(dto: FilterMatchDto) {
    const qb = this.matchRepo
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.field', 'field')
      .leftJoinAndSelect('field.location', 'location')
      .leftJoinAndSelect('match.players', 'players');
  
    if (dto.type) qb.andWhere('match.type = :type', { type: dto.type });
  
    if (dto.date) qb.andWhere('match.date = :date', { date: dto.date });
  
    if (dto.timeFrom && dto.timeTo) {
      qb.andWhere('match.time BETWEEN :from AND :to', {
        from: dto.timeFrom,
        to: dto.timeTo,
      });
    }
  
    if (dto.city) {
      qb.andWhere('location.city ILIKE :city', { city: `%${dto.city}%` });
    }
  
    if (dto.status) {
      qb.andWhere('match.status = :status', { status: dto.status });
    }
  
    if (dto.hasVacancy) {
      qb.andWhere('array_length(match.players, 1) < match.maxPlayers');
    }
  
    if (dto.isPublic) {
      qb.andWhere('match.password IS NULL');
    }
  
    if (dto.lat && dto.lng && dto.radius) {
      qb.andWhere(
        `
        ST_DWithin(
          location.coordinates::geography,
          ST_MakePoint(:lng, :lat)::geography,
          :radius
        )
      `,
        {
          lat: dto.lat,
          lng: dto.lng,
          radius: dto.radius * 1000, // en metros
        },
      );
    }
  
    return qb.getMany();
  }
  
  

  async joinMatch(matchId: string, user: Users) {
    const match = await this.matchRepo.findOne({
      where: { id: matchId },
      relations: ['players'],
    });
    if (!match) throw new NotFoundException('Match not found');

    const alreadyJoined = match.players.some((p) => p.uuid === user.uuid);
    if (alreadyJoined) throw new ForbiddenException('Already joined');

    if (match.players.length >= match.maxPlayers)
      throw new ForbiddenException('Match is full');

    match.players.push(user);
    return this.matchRepo.save(match);
  }

  async findUserMatches(userId: string) {
    return this.matchRepo.find({
      where: [{ creator: { uuid: userId } }, { players: { uuid: userId } }],
      relations: ['creator', 'players', 'field'],
    });
  }

  async updateMatch(id: string, dto: UpdateMatchDto, user: Users) {
    const match = await this.matchRepo.findOne({
      where: { id },
      relations: ['creator'],
    });
    if (!match) throw new NotFoundException('Match not found');
    if (match.creator.uuid !== user.uuid)
      throw new ForbiddenException('You are not the creator');

    Object.assign(match, dto);
    return this.matchRepo.save(match);
  }

  async removeMatch(id: string, user: Users) {
    const match = await this.matchRepo.findOne({
      where: { id },
      relations: ['creator', 'field'],
    });
  
    if (!match) throw new NotFoundException('Match not found');
    if (match.creator.uuid !== user.uuid)
      throw new ForbiddenException('You are not the creator');
  
    // Primero liberamos el horario ocupado en Schedule
    await this.scheduleRepo.delete({
      date: match.date,
      startTime: match.time,
      field: { id: match.field.id },
    });
  
    // Luego eliminamos el match
    return this.matchRepo.remove(match);
  }
  
}

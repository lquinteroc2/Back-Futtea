import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Users } from 'src/users/entities/user.entity';
import { FilterMatchDto } from './dto/filter-match.dto';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @UseGuards(AuthGuard)
  @Post()
  createMatch(
    @Body() dto: CreateMatchDto,
    @Req() req: Request & { user: Users },
  ) {
    return this.matchesService.createMatch(dto, req.user);
  }

  @Get()
  findAllMatches() {
    return this.matchesService.findAllMatches();
  }

  @Get('filter')
  filterMatches(@Query() dto: FilterMatchDto) {
    return this.matchesService.filterMatches(dto);
  }

  @Get(':locationId/fields/:fieldId/occupied')
  getOccupiedSchedules(@Param('fieldId') fieldId: string) {
    return this.matchesService.getOccupiedSchedules(fieldId);
  }


  @UseGuards(AuthGuard)
  @Post(':id/join')
  joinMatch(
    @Param('id') id: string,
    @Req() req: Request & { user: Users },
  ) {
    return this.matchesService.joinMatch(id, req.user);
  }

  @UseGuards(AuthGuard)
  @Get('my-matches')
  findUserMatches(@Req() req: Request & { user: Users }) {
    return this.matchesService.findUserMatches(req.user.uuid);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  updateMatch(
    @Param('id') id: string,
    @Body() dto: UpdateMatchDto,
    @Req() req: Request & { user: Users },
  ) {
    return this.matchesService.updateMatch(id, dto, req.user);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  removeMatch(
    @Param('id') id: string,
    @Req() req: Request & { user: Users },
  ) {
    return this.matchesService.removeMatch(id, req.user);
  }
}

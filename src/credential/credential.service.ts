import { InjectRepository } from '@nestjs/typeorm';
import { Credential, CredentialType } from './entities/credential.entity';
import { Repository } from 'typeorm';
import { Users } from 'src/users/entities/user.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CredentialService {
  constructor(
    @InjectRepository(Credential)
    private credentialRepo: Repository<Credential>,
  ) {}

  async findByTypeAndIdentifier(type: CredentialType, identifier: string) {
    return this.credentialRepo.findOne({
      where: { type, identifier },
      relations: ['user'],
    });
  }

  async create(data: { type: CredentialType; identifier: string; user: Users }) {
    const credential = this.credentialRepo.create({
      type: data.type,
      identifier: data.identifier,
      user: data.user,
    });
    return this.credentialRepo.save(credential);
  }
}

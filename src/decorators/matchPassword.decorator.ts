import {
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
  } from 'class-validator';
  
  @ValidatorConstraint({ name: 'MatchPassword', async: false })
  export class MatchPassword implements ValidatorConstraintInterface {
    validate(
      password: string,
      args?: ValidationArguments,
    ): Promise<boolean> | boolean {
      if (password !== args.object[args.constraints[0]]) return false;
      return true;
    }
  
    defaultMessage(): string {
        return 'Passwords do not match';
      }
  }
  
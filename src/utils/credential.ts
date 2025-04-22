import { Credential, CredentialType } from "src/credential/entities/credential.entity";


export function getLocalCredential(credentials: Credential[]): Credential | undefined {
  return credentials.find(c => c.type === CredentialType.LOCAL);
}
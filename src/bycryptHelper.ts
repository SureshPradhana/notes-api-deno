// not used as worker is not working and in my case this also not working so will use sync
// versions
import {
  compare as comparePromise,
  compareSync,
  genSalt,
  genSaltSync,
  hash as hashPromise,
  hashSync,
} from "https://deno.land/x/bcrypt/mod.ts";

export const isRunningInDenoDeploy = Deno.permissions?.query === undefined;
// Adjusting to include salt generation in the helper
export const generateSalt: typeof genSalt = isRunningInDenoDeploy
  ? (rounds: number = 10) => new Promise((res) => res(genSaltSync(rounds)))
  : genSalt;

export const hash: typeof hashPromise = isRunningInDenoDeploy
  ? async (plaintext: string, rounds: number = 10) => {
    const salt = await generateSalt(rounds);
    return new Promise((res) => res(hashSync(plaintext, salt)));
  }
  : hashPromise;

export const compare: typeof comparePromise = isRunningInDenoDeploy
  ? (plaintext: string, hash: string) =>
    new Promise((res) => res(compareSync(plaintext, hash)))
  : comparePromise;

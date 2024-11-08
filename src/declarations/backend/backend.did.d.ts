import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface FieldPoint {
  'direction' : Vector3D,
  'position' : Vector3D,
  'magnitude' : number,
}
export type Vector3D = Array<number>;
export interface _SERVICE {
  'calculateField' : ActorMethod<
    [number, number, Vector3D, Vector3D, number],
    Array<FieldPoint>
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];

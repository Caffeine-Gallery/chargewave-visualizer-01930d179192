export const idlFactory = ({ IDL }) => {
  const Vector3D = IDL.Vec(IDL.Float64);
  const FieldPoint = IDL.Record({
    'direction' : Vector3D,
    'position' : Vector3D,
    'magnitude' : IDL.Float64,
  });
  return IDL.Service({
    'calculateField' : IDL.Func(
        [IDL.Float64, IDL.Float64, Vector3D, Vector3D, IDL.Float64],
        [IDL.Vec(FieldPoint)],
        ['query'],
      ),
  });
};
export const init = ({ IDL }) => { return []; };

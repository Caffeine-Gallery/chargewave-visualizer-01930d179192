import Char "mo:base/Char";

import Float "mo:base/Float";
import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
import Int "mo:base/Int";

actor {
    // Type definitions for 3D vectors
    type Vector3D = [Float];
    type FieldPoint = {
        position: Vector3D;
        direction: Vector3D;
        magnitude: Float;
    };

    // Constants
    let EPSILON_0 : Float = 8.85e-12; // Permittivity of free space
    let k : Float = 1.0 / (4.0 * Float.pi * EPSILON_0);

    // Calculate electric field at a point due to a charge
    private func calculateFieldFromCharge(
        position: Vector3D,
        chargePosition: Vector3D,
        chargeStrength: Float
    ) : Vector3D {
        let dx = position[0] - chargePosition[0];
        let dy = position[1] - chargePosition[1];
        let dz = position[2] - chargePosition[2];
        
        let r2 = dx * dx + dy * dy + dz * dz;
        let r = Float.sqrt(r2);
        
        if (r < 0.1) {
            return [0.0, 0.0, 0.0];
        };
        
        let factor = k * chargeStrength / (r2 * r);
        
        return [
            dx * factor,
            dy * factor,
            dz * factor
        ];
    };

    // Add two vectors
    private func addVectors(v1: Vector3D, v2: Vector3D) : Vector3D {
        return [
            v1[0] + v2[0],
            v1[1] + v2[1],
            v1[2] + v2[2]
        ];
    };

    // Calculate magnitude of a vector
    private func magnitude(v: Vector3D) : Float {
        return Float.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    };

    // Normalize a vector
    private func normalize(v: Vector3D) : Vector3D {
        let mag = magnitude(v);
        if (mag == 0.0) {
            return [0.0, 0.0, 0.0];
        };
        return [
            v[0] / mag,
            v[1] / mag,
            v[2] / mag
        ];
    };

    // Public function to calculate the electric field
    public query func calculateField(
        charge1Strength: Float,
        charge2Strength: Float,
        charge1Pos: Vector3D,
        charge2Pos: Vector3D,
        density: Float
    ) : async [FieldPoint] {
        let gridSize = Int.abs(Float.toInt(density));
        let numPoints = gridSize * gridSize * gridSize;
        var fieldPoints : [var FieldPoint] = Array.init<FieldPoint>(
            numPoints,
            {
                position = [0.0, 0.0, 0.0];
                direction = [0.0, 0.0, 0.0];
                magnitude = 0.0;
            }
        );
        
        var index = 0;
        let step = 10.0 / Float.fromInt(gridSize);
        
        // Calculate field points in a 3D grid using integer iteration
        for (i in Iter.range(0, gridSize - 1)) {
            for (j in Iter.range(0, gridSize - 1)) {
                for (k in Iter.range(0, gridSize - 1)) {
                    let x = -5.0 + (Float.fromInt(i) * step);
                    let y = -5.0 + (Float.fromInt(j) * step);
                    let z = -5.0 + (Float.fromInt(k) * step);
                    
                    let position : Vector3D = [x, y, z];
                    
                    // Calculate field from both charges
                    let field1 = calculateFieldFromCharge(position, charge1Pos, charge1Strength);
                    let field2 = calculateFieldFromCharge(position, charge2Pos, charge2Strength);
                    
                    // Combine fields
                    let totalField = addVectors(field1, field2);
                    let mag = magnitude(totalField);
                    let dir = normalize(totalField);
                    
                    fieldPoints[index] := {
                        position = position;
                        direction = dir;
                        magnitude = mag;
                    };
                    
                    index += 1;
                };
            };
        };
        
        return Array.freeze(fieldPoints);
    };
};

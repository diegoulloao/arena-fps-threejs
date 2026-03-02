// Three.js
import { Canvas } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import { Physics } from "@react-three/cannon";

// 3D
import { Ground, FirstPerson, Player } from "@components/3d";

const GROUND_SIZE: [number, number] = [30, 30];

const Scene: React.FC = () => {
  return (
    <Canvas>
      <Sky
        distance={450000}
        sunPosition={[100000, 0, 0]}
        inclination={0}
        rayleigh={4}
        azimuth={180}
        mieDirectionalG={0.9}
        mieCoefficient={0.02}
        turbidity={20}
      />

      <ambientLight intensity={0.7} />

      <FirstPerson />

      <Physics>
        <Player yStartPoint={3} movementBounds={GROUND_SIZE} />
        <Ground size={GROUND_SIZE} />
      </Physics>
    </Canvas>
  );
};

export default Scene;

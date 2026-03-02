import { Physics } from "@react-three/cannon";
import { Sky } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import { Ground, FirstPerson, Player } from "@components/3d";
import {
  AMBIENT_LIGHT_INTENSITY,
  GROUND_SIZE,
  SKY_PROPS,
  WORLD_GRAVITY,
} from "./constants";
import { getPlayerStartY } from "./helpers";

const Scene: React.FC = () => {
  return (
    <Canvas>
      <Sky {...SKY_PROPS} />

      <ambientLight intensity={AMBIENT_LIGHT_INTENSITY} />

      <FirstPerson />

      <Physics gravity={WORLD_GRAVITY}>
        <Player yStartPoint={getPlayerStartY()} movementBounds={GROUND_SIZE} />
        <Ground size={GROUND_SIZE} />
      </Physics>
    </Canvas>
  );
};

export default Scene;

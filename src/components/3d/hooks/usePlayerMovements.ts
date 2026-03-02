import { useCallback, useEffect, useState } from "react";

interface PlayerActions {
  [key: React.KeyboardEvent["code"]]: Movement;
}

type Movements = typeof INITIAL_MOVEMENTS;
type Movement = keyof Movements;

// Constants
const INITIAL_MOVEMENTS = {
  moveForward: false,
  moveBackguard: false,
  moveLeft: false,
  moveRight: false,
  jump: false,
};

const PLAYER_ACTIONS: PlayerActions = {
  KeyW: "moveForward",
  KeyS: "moveBackguard",
  KeyA: "moveLeft",
  KeyD: "moveRight",
  Space: "jump",
};

const usePlayerMovements = (): Movements => {
  const [movements, setMovements] = useState(INITIAL_MOVEMENTS);

  const onKeyDown = useCallback((event: KeyboardEvent) => {
    const { code } = event;

    if (!(code in PLAYER_ACTIONS)) return;

    const action = PLAYER_ACTIONS[code as Movement];

    if (action) {
      setMovements((prevMovements) => ({
        ...prevMovements,
        [action]: true,
      }));
    }
  }, []);

  const onKeyUp = useCallback((event: KeyboardEvent) => {
    const { code } = event;

    if (!(code in PLAYER_ACTIONS)) return;

    const action = PLAYER_ACTIONS[code as Movement];

    if (action) {
      setMovements((prevMovements) => ({
        ...prevMovements,
        [action]: false,
      }));
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [onKeyDown, onKeyUp]);

  return movements;
};

export { usePlayerMovements };

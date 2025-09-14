// System manager to register, enable and disable game systems

export const createSystemManager = (bus, state) => {
  const systems = new Map();

  const register = (factory) => {
    const system = factory(bus, state);
    systems.set(system.id, { ...system, enabled: true });
    system.init?.();
  };

  const enable = (id) => {
    const sys = systems.get(id);
    if (sys) sys.enabled = true;
  };

  const disable = (id) => {
    const sys = systems.get(id);
    if (sys) sys.enabled = false;
  };

  const update = (dt) => {
    systems.forEach((sys) => {
      if (sys.enabled) {
        sys.update?.(dt);
      }
    });
  };

  return { register, enable, disable, update };
};

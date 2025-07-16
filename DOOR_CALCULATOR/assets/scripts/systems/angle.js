const angleParams = {
  "(1)+1C+1C+(1)": {
    doors: 4,
    rails: 2,
    side_rail_caps_45: 2,
    bottom_double_caps: 1,
    bottom_single_caps: 2,
    rail_to_rail_connectors: 2,
    rail_to_cap_connectors: 10,
    handles: 4,
    door_brush_joint: 4,
    cap_no_brush: 2,
    cap_with_brush: 4,
    corner_cap: 2,
    moving_mechanism_dovodchik: 1,
    moving_mechanism_belt_connector: 1,
    adapter_belt: 0,
    bottom_rollers: 1,
    corner_rubber_joint: 0,
    fixed_door_profile: 2,
    fixed_mechanism: 2,
    width_adjustment: 32
  },
  "1+2C+2C+1": {
    doors: 6,
    rails: 3,
    side_rail_caps_45: 2,
    bottom_double_caps: 2,
    bottom_single_caps: 2,
    rail_to_rail_connectors: 4,
    rail_to_cap_connectors: 12,
    handles: 4,
    door_brush_joint: 8,
    cap_no_brush: 2,
    cap_with_brush: 8,
    corner_cap: 2,
    moving_mechanism_dovodchik: 1,
    moving_mechanism_belt_connector: 1,
    adapter_belt: 2,
    bottom_rollers: 2,
    corner_rubber_joint: 0,
    fixed_door_profile: 2,
    fixed_mechanism: 2,
    width_adjustment: 70
  }
};

systemsData['angle'] = {
  name: 'Двери с угловым примыканием',
  minWidth: 1615,
  maxWidth: 6000,
  subsystems: {
    '(1)+1C+1C+(1)': {min:1615,max:4500,params: angleParams['(1)+1C+1C+(1)']},
    '1+2C+2C+1': {min:2145,max:6000,params: angleParams['1+2C+2C+1']}
  }
};

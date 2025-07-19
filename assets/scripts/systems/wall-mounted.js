systemsData['wall-mounted'] = {
  name: 'Настенные двери',
  extraField: true,
  minWidth: 500,
  maxWidth: 3000,
  subsystems: {
    'Система 1W': {
      min: 500,
      max: 1500,
      params: {
        num_doors: 1,
        num_rails_41: 1,
        num_rails_47: 0,
        num_side_caps_45: 2,
        num_side_caps_51: 0,
        num_bottom_single_caps: 2,
        num_bottom_double_caps: 0,
        num_rrconn: 0,
        num_rcconn: 6,
        num_handles: 2,
        profile_cap_no_brush: 2,
        profile_C_cap: 0,
        profile_V_cap: 0,
        n_ci: 1,
        n_ct: 0,
        corner_rubber_joint: 0,
        door_brush: 0,
        fixed_door_profile: 0,
        door_width_offset: 16
      }
    },
    'Система 1W+1W': {
      min: 1000,
      max: 3000,
      params: {
        num_doors: 2,
        num_rails_41: 1,
        num_rails_47: 0,
        num_side_caps_45: 2,
        num_side_caps_51: 0,
        num_bottom_single_caps: 2,
        num_bottom_double_caps: 0,
        num_rrconn: 0,
        num_rcconn: 6,
        num_handles: 4,
        profile_cap_no_brush: 2,
        profile_C_cap: 1,
        profile_V_cap: 1,
        n_ci: 2,
        n_ct: 0,
        corner_rubber_joint: 1,
        door_brush: 0,
        fixed_door_profile: 0,
        door_width_offset: 32
      }
    },
    'Система 1SW+1SW': {
      min: 1000,
      max: 3000,
      params: {
        num_doors: 2,
        num_rails_41: 0,
        num_rails_47: 1,
        num_side_caps_45: 0,
        num_side_caps_51: 2,
        num_bottom_single_caps: 2,
        num_bottom_double_caps: 0,
        num_rrconn: 0,
        num_rcconn: 6,
        num_handles: 4,
        profile_cap_no_brush: 2,
        profile_C_cap: 1,
        profile_V_cap: 1,
        n_ci: 1,
        n_ct: 1,
        corner_rubber_joint: 1,
        door_brush: 0,
        fixed_door_profile: 1,
        door_width_offset: 17
      }
    }
  }
};

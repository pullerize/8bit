import { prices } from '../data/prices.js';

export function calcDoorWidth(width, openWidth, subsystem, params, system) {
  let raw;

  // Systems that rely on open width
  if (system === 'embedded-wall') {
    switch (subsystem) {
      case '2+0':
        raw = (openWidth + 17.5 + 16) / params.num_doors; break;
      case '2+0|2+0':
        raw = (openWidth + 70 - 15 + 32) / params.num_doors; break;
      case '1WPUSH':
        raw = (openWidth - 6) / params.num_doors; break;
      case '2WPUSH':
        raw = (openWidth - 6 + 16) / params.num_doors; break;
      default:
        raw = openWidth / Math.max(1, params.num_doors || 1);
    }
  } else if (system === 'wall-mounted') {
    switch (subsystem) {
      case 'Система 1W':
        raw = (openWidth + 16) / params.num_doors; break;
      case 'Система 1W+1W':
        raw = (openWidth + 32) / params.num_doors; break;
      case 'Система 1SW+1SW':
        raw = (openWidth + 32 - 15) / params.num_doors; break;
      default:
        raw = openWidth / Math.max(1, params.num_doors || 1);
    }
  } else {
    // Cascading and other systems based on full width
    switch(subsystem){
      case '3+0': raw = (width + 35) / params.num_doors; break;
      case '4+0': raw = (width + 52) / params.num_doors; break;
      case '5+0': raw = (width + 70) / params.num_doors; break;
      case '6+0': raw = (width + 87) / params.num_doors; break;
      case '7+0': raw = (width + 105) / params.num_doors; break;
      case '8+0': raw = (width + 122) / params.num_doors; break;
      case '3+0|3+0': raw = (width + 70 - 15) / params.num_doors; break;
      case '4+0|4+0': raw = (width + 105 - 15) / params.num_doors; break;
      case '5+0|5+0': raw = (width + 140 - 15) / params.num_doors; break;
      case '6+0|6+0': raw = (width + 175 - 15) / params.num_doors; break;
      case '7+0|7+0': raw = (width + 210 - 15) / params.num_doors; break;
      case '8+0|8+0': raw = (width + 245 - 15) / params.num_doors; break;
      default:
        const clear = subsystem.replace(/[()+\s]/g, '');
        switch(clear){
          case '1':
            raw = width / Math.max(1, params.num_doors || 1); break;
          case '11':
            raw = (width + 16) / Math.max(1, params.num_doors || 1); break;
          case '111':
            raw = (width + 32) / Math.max(1, params.num_doors || 1); break;
          case '1111':
            raw = (width + 32 - 15) / Math.max(1, params.num_doors || 1); break;
          default:
            const adj = params.width_adjustment || params.door_width_offset || 0;
            raw = (width + adj) / Math.max(1, params.num_doors || 1);
        }
    }
  }

  if (raw === undefined) {
    const base = width / Math.max(1, params.num_doors || 1);
    raw = base;
  }
  let dw = Math.floor(raw);
  if(raw - dw > 0.4) dw += 1;
  return dw;
}

export function calculateComponents(width, height, openWidth, system, subsystem, params, glass, shotlan) {
  const doorWidth = calcDoorWidth(width, openWidth, subsystem, params, system);
  const components = [];
  const add = (name, qty, formula) => {
    if (qty > 0) {
      const price = prices[name] || 0;
      const sum = Math.round(qty * price * 100) / 100;
      components.push({ name, qty, price, sum, formula });
    }
  };
  add('vertical_profile', (height<=3200?1:2)*params.num_doors, `(${height}<=3200?1:2)*${params.num_doors}`);
  add('cap_no_brush', (height<=3200?0.5:1)*(params.profile_cap_no_brush||0), `(${height}<=3200?0.5:1)*${params.profile_cap_no_brush||0}`);
  add('cap_with_brush', (height<=3200?0.5:1)*(params.profile_cap_with_brush||0), `(${height}<=3200?0.5:1)*${params.profile_cap_with_brush||0}`);
  add('profile_C_cap', (height<=3200?0.5:1)*(params.profile_C_cap||0), `(${height}<=3200?0.5:1)*${params.profile_C_cap||0}`);
  add('profile_V_cap', (height<=3200?0.5:1)*(params.profile_V_cap||0), `(${height}<=3200?0.5:1)*${params.profile_V_cap||0}`);
  add('horizontal_profile', (doorWidth<=1000?1:2)*params.num_doors, `(${doorWidth}<=1000?1:2)*${params.num_doors}`);
  add('glass_seal', Math.ceil(((doorWidth+height)*2/2500)*params.num_doors), `ceil(((${doorWidth}+${height})*2/2500)*${params.num_doors})`);
  add('bolts', params.num_doors*8, `${params.num_doors}*8`);
  add('handles', params.num_handles||0, `${params.num_handles||0}`);
  add('top_rail_rubber', Math.ceil((width*params.num_rails*2)/1000), `ceil((${width}*${params.num_rails}*2)/1000)`);
  add('door_brush_joint', Math.ceil((params.door_brush||0)*params.num_doors*height/1000), `ceil((${params.door_brush||0})*${params.num_doors}*${height}/1000)`);
  const railMult = width<=3000?0.5:(width<=6000?1:(width<=9000?1.5:2));
  const capMult = width<=3000?1:(width<=6000?2:(width<=9000?3:4));
  add('top_rails_41', railMult*params.num_rails, `${railMult}*${params.num_rails}`);
  add('side_rail_caps_45', railMult*params.num_side_caps, `${railMult}*${params.num_side_caps}`);
  add('bottom_double_caps', capMult*params.num_bottom_double_caps, `${capMult}*${params.num_bottom_double_caps}`);
  add('bottom_single_caps', capMult*params.num_bottom_single_caps, `${capMult}*${params.num_bottom_single_caps}`);
  add('rail_to_rail_connectors', Math.ceil(width/300*(params.num_rail_to_rail_connectors||0)), `ceil(${width}/300*${params.num_rail_to_rail_connectors||0})`);
  add('rail_to_cap_connectors', Math.ceil(width/300*(params.num_rail_to_cap_connectors||0)), `ceil(${width}/300*${params.num_rail_to_cap_connectors||0})`);
  add('metal_rail_aligner', Math.ceil(width/500*params.num_rails), `ceil(${width}/500*${params.num_rails})`);
  add('plastic_rail_aligner', Math.ceil(width/500*params.num_rails*2), `ceil(${width}/500*${params.num_rails}*2)`);
  add('moving_mechanism_ci', params.moving_mechanism_ci||0, `${params.moving_mechanism_ci||0}`);
  add('belt_connector_mechanism', params.belt_connector_mechanism||0, `${params.belt_connector_mechanism||0}`);
  add('belt_adapter', params.belt_adapter||0, `${params.belt_adapter||0}`);
  add('bottom_rollers', params.bottom_rollers||0, `${params.bottom_rollers||0}`);
  add('corner_rubber_joint', Math.ceil(height*2/1000*(params.corner_rubber_joint||0)), `ceil(${height}*2/1000*${params.corner_rubber_joint||0})`);
  add('moving_mechanism', params.moving_mechanism||0, `${params.moving_mechanism||0}`);
  add('fixed_mechanism', params.fixed_mechanism||0, `${params.fixed_mechanism||0}`);
  add('fixed_door_profile', (doorWidth-12<=970?1:2)*(params.fixed_door_profile||0), `(${doorWidth}-12<=970?1:2)*${params.fixed_door_profile||0}`);
  const area = width*height/1000000;
  const glassPrice = (prices.glass && prices.glass[glass]) || 0;
  components.push({name:'glass',qty:area,price:glassPrice,sum:Math.round(area*glassPrice*100)/100,formula:`${width}*${height}/1000000`});
  components.push({name:'installation',qty:area,price:prices.installation,sum:Math.round(area*prices.installation*100)/100,formula:`${width}*${height}/1000000`});
  components.push({name:'logistics',qty:1,price:prices.logistics,sum:prices.logistics,formula:'1'});
  let total=0;
  components.forEach(c=>{total+=c.sum;});
  return {components,total,doorWidth};
}

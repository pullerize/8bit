function calcDoorWidth(width, subsystem, params) {
  if (!subsystem) {
    const base = width / Math.max(1, params.num_doors || 1);
    const dw = Math.floor(base);
    return base - dw > 0.4 ? dw + 1 : dw;
  }
  let raw;
  switch (subsystem) {
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
      switch (clear) {
        case '1': raw = width / Math.max(1, params.num_doors); break;
        case '11': raw = (width + 16) / Math.max(1, params.num_doors); break;
        case '111': raw = (width + 32) / Math.max(1, params.num_doors); break;
        case '1111': raw = (width + 32 - 15) / Math.max(1, params.num_doors); break;
        default: raw = width / Math.max(1, params.num_doors);
      }
  }
  let dw = Math.floor(raw);
  if (raw - dw > 0.4) dw += 1;
  return dw;
}

function calculateComponents(width, height, subsystem, params, glass, shotlan) {
  const doorWidth = calcDoorWidth(width, subsystem, params);
  const components = [];
  const add = (name, qty, formula) => {
    if (qty > 0) {
      const price = prices[name] || 0;
      const sum = Math.round(qty * price * 100) / 100;
      components.push({ name, qty, price, sum, formula });
    }
  };
  add('vertical_profile', (height <= 3200 ? 1 : 2) * params.num_doors,
      `(${height}<=3200?1:2)*${params.num_doors}`);
  add('cap_no_brush', (height <= 3200 ? 0.5 : 1) * (params.profile_cap_no_brush || 0),
      `(${height}<=3200?0.5:1)*${params.profile_cap_no_brush || 0}`);
  add('cap_with_brush', (height <= 3200 ? 0.5 : 1) * (params.profile_cap_with_brush || 0),
      `(${height}<=3200?0.5:1)*${params.profile_cap_with_brush || 0}`);
  add('profile_C_cap', (height <= 3200 ? 0.5 : 1) * (params.profile_C_cap || 0),
      `(${height}<=3200?0.5:1)*${params.profile_C_cap || 0}`);
  add('profile_V_cap', (height <= 3200 ? 0.5 : 1) * (params.profile_V_cap || 0),
      `(${height}<=3200?0.5:1)*${params.profile_V_cap || 0}`);
  add('horizontal_profile', (doorWidth <= 1000 ? 1 : 2) * params.num_doors,
      `(${doorWidth}<=1000?1:2)*${params.num_doors}`);
  add('glass_seal', Math.ceil(((doorWidth + height) * 2 / 2500) * params.num_doors),
      `ceil(((${doorWidth}+${height})*2/2500)*${params.num_doors})`);
  add('bolts', params.num_doors * 8,
      `${params.num_doors}*8`);
  add('handles', params.num_handles || 0,
      `${params.num_handles || 0}`);
  add('top_rail_rubber', Math.ceil((width * params.num_rails * 2) / 1000),
      `ceil((${width}*${params.num_rails}*2)/1000)`);
  add('door_brush_joint',
      Math.ceil((params.door_brush || 0) * params.num_doors * height / 1000),
      `ceil((${params.door_brush || 0})*${params.num_doors}*${height}/1000)`);
  const railMult = width <= 3000 ? 0.5 : (width <= 6000 ? 1 : (width <= 9000 ? 1.5 : 2));
  const capMult = width <= 3000 ? 1 : (width <= 6000 ? 2 : (width <= 9000 ? 3 : 4));
  add('top_rails_41', railMult * params.num_rails,
      `${railMult}*${params.num_rails}`);
  add('side_rail_caps_45', railMult * params.num_side_caps,
      `${railMult}*${params.num_side_caps}`);
  add('bottom_double_caps', capMult * params.num_bottom_double_caps,
      `${capMult}*${params.num_bottom_double_caps}`);
  add('bottom_single_caps', capMult * params.num_bottom_single_caps,
      `${capMult}*${params.num_bottom_single_caps}`);
  add('rail_to_rail_connectors', Math.ceil(width / 300 * (params.num_rail_to_rail_connectors || 0)),
      `ceil(${width}/300*${params.num_rail_to_rail_connectors || 0})`);
  add('rail_to_cap_connectors', Math.ceil(width / 300 * (params.num_rail_to_cap_connectors || 0)),
      `ceil(${width}/300*${params.num_rail_to_cap_connectors || 0})`);
  add('metal_rail_aligner', Math.ceil(width / 500 * params.num_rails),
      `ceil(${width}/500*${params.num_rails})`);
  add('plastic_rail_aligner', Math.ceil(width / 500 * params.num_rails * 2),
      `ceil(${width}/500*${params.num_rails}*2)`);
  add('moving_mechanism_ci', params.moving_mechanism_ci || 0,
      `${params.moving_mechanism_ci || 0}`);
  add('belt_connector_mechanism', params.belt_connector_mechanism || 0,
      `${params.belt_connector_mechanism || 0}`);
  add('belt_adapter', (doorWidth - 12 <= 970 ? 1 : 2) * (params.belt_adapter || 0),
      `(${doorWidth}-12<=970?1:2)*${params.belt_adapter || 0}`);
  add('bottom_rollers', params.bottom_rollers || 0,
      `${params.bottom_rollers || 0}`);
  add('corner_rubber_joint', Math.ceil(height * 2 / 1000 * (params.corner_rubber_joint || 0)),
      `ceil(${height}*2/1000*${params.corner_rubber_joint || 0})`);
  add('moving_mechanism', params.moving_mechanism || 0,
      `${params.moving_mechanism || 0}`);
  add('fixed_mechanism', params.fixed_mechanism || 0,
      `${params.fixed_mechanism || 0}`);
  add('fixed_door_profile', (doorWidth - 12 <= 970 ? 1 : 2) * (params.fixed_door_profile || 0),
      `(${doorWidth}-12<=970?1:2)*${params.fixed_door_profile || 0}`);
  const area = width * height / 1000000;
  const glassPrice = (prices.glass && prices.glass[glass]) || 0;
  components.push({ name: 'glass', qty: area, price: glassPrice, sum: Math.round(area * glassPrice * 100) / 100, formula: `${width}*${height}/1000000` });
  components.push({ name: 'installation', qty: area, price: prices.installation, sum: Math.round(area * prices.installation * 100) / 100, formula: `${width}*${height}/1000000` });
  components.push({ name: 'logistics', qty: 1, price: prices.logistics, sum: prices.logistics, formula: '1' });
  // обработка шотланок
  switch (shotlan) {
    case '1шт по горизонтали': {
      const divider = ((doorWidth - 32) <= 995 ? 1 : 2) * params.num_doors;
      add('divider_profile', divider,
          `(${doorWidth}-32<=995?1:2)*${params.num_doors}`);
      add('additional_glass_seal', divider * 2 * 1000 / 2500,
          `${divider}*2*1000/2500`);
      add('bolts_extra', params.num_doors * 8,
          `${params.num_doors}*8`);
      break; }
    case '1шт по вертикали': {
      const divider = (height <= 3000 ? 3 : 4) * params.num_doors;
      add('divider_profile', divider,
          `(${height}<=3000?3:4)*${params.num_doors}`);
      add('additional_glass_seal', divider * 2 * 1000 / 2500,
          `${divider}*2*1000/2500`);
      add('bolts_extra', params.num_doors * 8,
          `${params.num_doors}*8`);
      break; }
    case '2шт по горизонтали': {
      const divider = ((doorWidth - 32) <= 995 ? 1 : 2) * params.num_doors * 2;
      add('divider_profile', divider,
          `(${doorWidth}-32<=995?1:2)*${params.num_doors}*2`);
      add('additional_glass_seal', divider * 2 * 1000 / 2500,
          `${divider}*2*1000/2500`);
      add('bolts_extra', params.num_doors * 16,
          `${params.num_doors}*16`);
      break; }
    case '1шт по вертикали и 1шт по горизонтали': {
      const vertical = (height <= 3200 ? 3 : 4) * params.num_doors;
      const horizontal = ((doorWidth - 32) <= 995 ? 1 : 2) * params.num_doors;
      const divCnt = vertical + horizontal;
      add('divider_profile', divCnt,
          `${vertical}+${horizontal}`);
      add('additional_glass_seal', divCnt * 2 * 1000 / 2500,
          `${divCnt}*2*1000/2500`);
      add('bolts_extra', params.num_doors * 16,
          `${params.num_doors}*16`);
      break; }
    case '1шт по вертикали и 2шт по горизонтали': {
      const vertical = (height <= 3200 ? 3 : 4) * params.num_doors;
      const horizontal = ((doorWidth - 32) <= 995 ? 1 : 2) * 2 * params.num_doors;
      const divCnt = vertical + horizontal;
      add('divider_profile', divCnt,
          `${vertical}+${horizontal}`);
      add('additional_glass_seal', divCnt * 2 * 1000 / 2500,
          `${divCnt}*2*1000/2500`);
      add('bolts_extra', params.num_doors * 24,
          `${params.num_doors}*24`);
      break; }
    case '1шт по вертикали и 3шт по горизонтали': {
      let adhesive = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 3 + (height <= 3000 ? 3 : 4);
      adhesive = adhesive * 2 * params.num_doors;
      add('adhesive_profile', adhesive,
          `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*3+(${height}<=3000?3:4))*2*${params.num_doors}`);
      add('tape_33m', Math.ceil(adhesive / 33),
          `ceil(${adhesive}/33)`);
      break; }
    case '1шт по вертикали и 4шт по горизонтали': {
      let adhesive = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 4 + (height <= 3000 ? 3 : 4);
      adhesive = adhesive * 2 * params.num_doors;
      add('adhesive_profile', adhesive,
          `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*4+(${height}<=3000?3:4))*2*${params.num_doors}`);
      add('tape_33m', Math.ceil(adhesive / 33),
          `ceil(${adhesive}/33)`);
      break; }
    case '1шт по вертикали и 5шт по горизонтали': {
      let adhesive = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 5 + (height <= 3000 ? 3 : 4);
      adhesive = adhesive * 2 * params.num_doors;
      add('adhesive_profile', adhesive,
          `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*5+(${height}<=3000?3:4))*2*${params.num_doors}`);
      add('tape_33m', Math.ceil(adhesive / 33),
          `ceil(${adhesive}/33)`);
      break; }
    case 'Очень много разделений': {
      const hBase = (doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3);
      const heightUnits = Math.ceil(height / 40);
      const adhesive = hBase * heightUnits * 2;
      add('adhesive_profile', adhesive,
          `${hBase}*${heightUnits}*2`);
      add('tape_33m', Math.ceil(adhesive / 33),
          `ceil(${adhesive}/33)`);
      break; }
  }
  let total = 0;
  components.forEach(c => { total += c.sum; });
  return { components, total, doorWidth };
}

function calculatePartitionComponents(widthFull, height, subsystem, params, glass, shotlan) {
  const numDoors = params.num_doors || 1;
  const numHandles = params.num_handles || 0;
  const numRails = params.num_rails || 0;
  const capNoBrush = params.profile_cap_no_brush || 0;
  const capWithBrush = params.profile_cap_with_brush || 0;
  const capC = params.profile_C_cap || 0;
  const capV = params.profile_V_cap || 0;
  const numSideCaps = params.num_side_caps || 0;
  const numBotDbl = params.num_bottom_double_caps || 0;
  const numBotSngl = params.num_bottom_single_caps || 0;
  const numRRConn = params.num_rail_to_rail_connectors || 0;
  const numRCConn = params.num_rail_to_cap_connectors || 0;
  const numBrush = params.door_brush || 0;
  const movMech = params.moving_mechanism || 0;
  const fixMech = params.fixed_mechanism || 0;
  const fixProf = params.fixed_door_profile || 0;
  const offset = params.door_width_offset || 0;

  let raw = (widthFull + offset) / Math.max(1, numDoors);
  let doorWidth = Math.floor(raw);
  if (raw - doorWidth > 0.4) doorWidth += 1;

  const components = [];
  const add = (name, qty, formula) => { if (qty > 0) { const p = prices[name] || 0; components.push({ name, qty, price: p, sum: Math.round(qty * p * 100) / 100, formula }); } };

  add('vertical_profile', (height <= 3200 ? 1 : 2) * numDoors, `(${height}<=3200?1:2)*${numDoors}`);
  add('cap_no_brush', (height <= 3200 ? 0.5 : 1) * capNoBrush, `(${height}<=3200?0.5:1)*${capNoBrush}`);
  add('cap_with_brush', (height <= 3200 ? 0.5 : 1) * capWithBrush, `(${height}<=3200?0.5:1)*${capWithBrush}`);
  add('profile_C_cap', (height <= 3200 ? 0.5 : 1) * capC, `(${height}<=3200?0.5:1)*${capC}`);
  add('profile_V_cap', (height <= 3200 ? 0.5 : 1) * capV, `(${height}<=3200?0.5:1)*${capV}`);
  add('horizontal_profile', (doorWidth <= 1000 ? 1 : 2) * numDoors, `(${doorWidth}<=1000?1:2)*${numDoors}`);
  add('glass_seal', Math.ceil(((doorWidth + height) * 2 / 2500) * numDoors), `ceil(((${doorWidth}+${height})*2/2500)*${numDoors})`);
  add('bolts', numDoors * 8, `${numDoors}*8`);
  add('handles', numHandles, `${numHandles}`);
  add('top_rail_rubber', Math.ceil((widthFull * numRails * 2) / 1000), `ceil((${widthFull}*${numRails}*2)/1000)`);
  add('door_brush_joint', Math.ceil(numBrush * numDoors * height / 1000), `ceil(${numBrush}*${numDoors}*${height}/1000)`);
  const railMult = widthFull <= 3000 ? 0.5 : (widthFull <= 6000 ? 1 : (widthFull <= 9000 ? 1.5 : 2));
  const capMult = widthFull <= 3000 ? 1 : (widthFull <= 6000 ? 2 : (widthFull <= 9000 ? 3 : 4));
  add('top_rails', railMult * numRails, `${railMult}*${numRails}`);
  add('side_rail_caps_45', railMult * numSideCaps, `${railMult}*${numSideCaps}`);
  add('bottom_double_caps', capMult * numBotDbl, `${capMult}*${numBotDbl}`);
  add('bottom_single_caps', capMult * numBotSngl, `${capMult}*${numBotSngl}`);
  add('rail_to_rail_connectors', Math.ceil(widthFull / 300 * numRRConn), `ceil(${widthFull}/300*${numRRConn})`);
  add('rail_to_cap_connectors', Math.ceil(widthFull / 300 * numRCConn), `ceil(${widthFull}/300*${numRCConn})`);
  add('metal_rail_aligner', Math.ceil(widthFull / 500 * numRails), `ceil(${widthFull}/500*${numRails})`);
  add('plastic_rail_aligner', Math.ceil(widthFull / 500 * numRails * 2), `ceil(${widthFull}/500*${numRails}*2)`);
  add('moving_mechanism', movMech, `${movMech}`);
  add('fixed_mechanism', fixMech, `${fixMech}`);
  add('fixed_door_profile', fixProf, `${fixProf}`);
  add('corner_rubber_joint', Math.ceil(height * 2 / 1000), `ceil(${height}*2/1000)`);

  const area = widthFull * height / 1000000;
  const gp = (prices.glass && prices.glass[glass]) || 0;
  components.push({ name: 'glass', qty: area, price: gp, sum: Math.round(area * gp * 100) / 100, formula: `${widthFull}*${height}/1000000` });
  components.push({ name: 'installation', qty: area, price: prices.installation, sum: Math.round(area * prices.installation * 100) / 100, formula: `${widthFull}*${height}/1000000` });
  components.push({ name: 'logistics', qty: 1, price: prices.logistics, sum: prices.logistics, formula: '1' });

  switch (shotlan) {
    case '1шт по горизонтали': {
      const d = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors;
      add('divider_profile', d, `(${doorWidth}-32<=995?1:2)*${numDoors}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 8, `${numDoors}*8`);
      break; }
    case '1шт по вертикали': {
      const d = (height <= 3000 ? 3 : 4) * numDoors;
      add('divider_profile', d, `(${height}<=3000?3:4)*${numDoors}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 8, `${numDoors}*8`);
      break; }
    case '2шт по горизонтали': {
      const d = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors * 2;
      add('divider_profile', d, `(${doorWidth}-32<=995?1:2)*${numDoors}*2`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 16, `${numDoors}*16`);
      break; }
    case '1шт по вертикали и 1шт по горизонтали': {
      const v = (height <= 3200 ? 3 : 4) * numDoors;
      const h = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors;
      const d = v + h;
      add('divider_profile', d, `${v}+${h}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 16, `${numDoors}*16`);
      break; }
    case '1шт по вертикали и 2шт по горизонтали': {
      const v = (height <= 3200 ? 3 : 4) * numDoors;
      const h = ((doorWidth - 32) <= 995 ? 1 : 2) * 2 * numDoors;
      const d = v + h;
      add('divider_profile', d, `${v}+${h}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 24, `${numDoors}*24`);
      break; }
    case '1шт по вертикали и 3шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 3 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh, `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*3+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
    case '1шт по вертикали и 4шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 4 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh, `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*4+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
    case '1шт по вертикали и 5шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 5 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh, `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*5+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
    case 'Очень много разделений': {
      const hBase = (doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3);
      const heightUnits = Math.ceil(height / 40);
      const adh = hBase * heightUnits * 2;
      add('adhesive_profile', adh, `${hBase}*${heightUnits}*2`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
  }
  let total = 0; components.forEach(c => { total += c.sum; });
  return { components, total, doorWidth };
}

function calculateWallMountedComponents(widthFull, openWidth, height, subsystem, params, glass, shotlan) {
  const numDoors = params.num_doors || 1;
  let raw;
  switch (subsystem) {
    case 'Система 1W': raw = (openWidth + 16) / numDoors; break;
    case 'Система 1W+1W': raw = (openWidth + 32) / numDoors; break;
    case 'Система 1SW+1SW': raw = (openWidth + 32 - 15) / numDoors; break;
    default: raw = openWidth / numDoors;
  }
  let doorWidth = Math.floor(raw);
  if (raw - doorWidth > 0.4) doorWidth += 1;

  const components = [];
  const add = (n, q, f) => { if (q > 0) { const p = prices[n] || 0; components.push({ name: n, qty: q, price: p, sum: Math.round(q * p * 100) / 100, formula: f }); } };

  add('vertical_profile', (height <= 3200 ? 1 : 2) * numDoors, `(${height}<=3200?1:2)*${numDoors}`);
  add('cap_no_brush', (height <= 3200 ? 0.5 : 1) * (params.profile_cap_no_brush || 0), `(${height}<=3200?0.5:1)*${params.profile_cap_no_brush || 0}`);
  add('cap_with_brush', (height <= 3200 ? 0.5 : 1) * (params.cap_with_brush || 0), `(${height}<=3200?0.5:1)*${params.cap_with_brush || 0}`);
  add('profile_C_cap', (height <= 3200 ? 0.5 : 1) * (params.profile_C_cap || 0), `(${height}<=3200?0.5:1)*${params.profile_C_cap || 0}`);
  add('profile_V_cap', (height <= 3200 ? 0.5 : 1) * (params.profile_V_cap || 0), `(${height}<=3200?0.5:1)*${params.profile_V_cap || 0}`);
  add('horizontal_profile', (doorWidth <= 1000 ? 1 : 2) * numDoors, `(${doorWidth}<=1000?1:2)*${numDoors}`);
  add('glass_seal', Math.ceil(((doorWidth + height) * 2 / 2500) * numDoors), `ceil(((${doorWidth}+${height})*2/2500)*${numDoors})`);
  add('bolts', numDoors * 8, `${numDoors}*8`);
  add('handles', params.num_handles || 0, `${params.num_handles || 0}`);
  add('top_rail_rubber', Math.ceil((widthFull * (params.num_rails_41 || 0) * 2) / 1000), `ceil((${widthFull}*${params.num_rails_41 || 0}*2)/1000)`);
  add('door_brush_joint', Math.ceil((params.door_brush || 0) * numDoors * height / 1000), `ceil((${params.door_brush || 0})*${numDoors}*${height}/1000)`);
  const railMult = widthFull <= 3000 ? 0.5 : 1;
  const capMult = widthFull <= 3000 ? 1 : 2;
  add('top_rails_41', railMult * (params.num_rails_41 || 0), `${railMult}*${params.num_rails_41 || 0}`);
  add('top_rails_47', railMult * (params.num_rails_47 || 0), `${railMult}*${params.num_rails_47 || 0}`);
  add('side_rail_caps_45', railMult * (params.num_side_caps_45 || 0), `${railMult}*${params.num_side_caps_45 || 0}`);
  add('side_rail_caps_51', railMult * (params.num_side_caps_51 || 0), `${railMult}*${params.num_side_caps_51 || 0}`);
  add('bottom_single_caps', capMult * (params.num_bottom_single_caps || 0), `${capMult}*${params.num_bottom_single_caps || 0}`);
  add('bottom_double_caps', capMult * (params.num_bottom_double_caps || 0), `${capMult}*${params.num_bottom_double_caps || 0}`);
  const numRCConn = params.num_rcconn ?? params.num_rail_to_cap_connectors ?? 0;
  const numRRConn = params.num_rrconn ?? params.num_rail_to_rail_connectors ?? 0;
  add('rail_to_cap_connectors', Math.ceil(widthFull / 300 * numRCConn), `ceil(${widthFull}/300*${numRCConn})`);
  add('rail_to_rail_connectors', numRRConn, `${numRRConn}`);
  add('metal_rail_aligner', Math.ceil(widthFull / 500 * (params.num_rails_41 || 0)), `ceil(${widthFull}/500*${params.num_rails_41 || 0})`);
  add('plastic_rail_aligner', Math.ceil(widthFull / 500 * (params.num_rails_41 || 0) * 2), `ceil(${widthFull}/500*${params.num_rails_41 || 0}*2)`);
  add('wall_connector', Math.ceil(widthFull / 400), `ceil(${widthFull}/400)`);
  const nci = params.n_ci ?? params.moving_mechanism_ci ?? 0;
  const nct = params.n_ct ?? params.moving_mechanism_ct ?? 0;
  add('moving_mechanism_ci', nci, `${nci}`);
  add('moving_mechanism_ct', nct, `${nct}`);
  add('belt_adapter', (doorWidth - 12 <= 970 ? 1 : 2) * (params.belt_adapter || 0), `(${doorWidth}-12<=970?1:2)*${params.belt_adapter || 0}`);
  add('bottom_rollers', params.bottom_rollers || 0, `${params.bottom_rollers || 0}`);
  add('corner_rubber_joint', Math.ceil((params.corner_rubber_joint || 0) * 2 * height / 1000), `ceil(${params.corner_rubber_joint || 0}*2*${height}/1000)`);
  add('fixed_door_profile', (doorWidth - 12 <= 970 ? 1 : 2) * (params.fixed_door_profile || 0), `(${doorWidth}-12<=970?1:2)*${params.fixed_door_profile || 0}`);

  const area = openWidth * height / 1000000;
  const gp = (prices.glass && prices.glass[glass]) || 0;
  components.push({ name: 'glass', qty: area, price: gp, sum: Math.round(area * gp * 100) / 100, formula: `${openWidth}*${height}/1000000` });
  components.push({ name: 'installation', qty: area, price: prices.installation, sum: Math.round(area * prices.installation * 100) / 100, formula: `${openWidth}*${height}/1000000` });
  components.push({ name: 'logistics', qty: 1, price: prices.logistics, sum: prices.logistics, formula: '1' });

  switch (shotlan) {
    case '1шт по горизонтали': {
      const d = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors;
      add('divider_profile', d, `(${doorWidth}-32<=995?1:2)*${numDoors}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 8, `${numDoors}*8`);
      break; }
    case '1шт по вертикали': {
      const d = (height <= 3000 ? 3 : 4) * numDoors;
      add('divider_profile', d, `(${height}<=3000?3:4)*${numDoors}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 8, `${numDoors}*8`);
      break; }
    case '2шт по горизонтали': {
      const d = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors * 2;
      add('divider_profile', d, `(${doorWidth}-32<=995?1:2)*${numDoors}*2`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 16, `${numDoors}*16`);
      break; }
    case '1шт по вертикали и 1шт по горизонтали': {
      const v = (height <= 3200 ? 3 : 4) * numDoors;
      const h = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors;
      const d = v + h;
      add('divider_profile', d, `${v}+${h}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 16, `${numDoors}*16`);
      break; }
    case '1шт по вертикали и 2шт по горизонтали': {
      const v = (height <= 3200 ? 3 : 4) * numDoors;
      const h = ((doorWidth - 32) <= 995 ? 1 : 2) * 2 * numDoors;
      const d = v + h;
      add('divider_profile', d, `${v}+${h}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 24, `${numDoors}*24`);
      break; }
    case '1шт по вертикали и 3шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 3 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh, `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*3+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
    case '1шт по вертикали и 4шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 4 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh, `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*4+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
    case '1шт по вертикали и 5шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 5 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh, `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*5+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
    case 'Очень много разделений': {
      const hBase = (doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3);
      const heightUnits = Math.ceil(height / 40);
      const adh = hBase * heightUnits * 2;
      add('adhesive_profile', adh, `${hBase}*${heightUnits}*2`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
  }
  let total = 0; components.forEach(c => { total += c.sum; });
  return { components, total, doorWidth };
}

function calculateAngleComponents(widthFull, height, subsystem, params, glass, shotlan) {
  const numDoors = params.doors || 1;
  const numHandles = params.handles || 0;
  const numRails = params.rails || 0;
  const capNoBrush = params.cap_no_brush || 0;
  const capWithBrush = params.cap_with_brush || 0;
  const capCorner = params.corner_cap || 0;
  const numSideCaps = params.side_rail_caps_45 || 0;
  const numBotDbl = params.bottom_double_caps || 0;
  const numBotSngl = params.bottom_single_caps || 0;
  const numRRConn = params.rail_to_rail_connectors || 0;
  const numRCConn = params.rail_to_cap_connectors || 0;
  const numMovDov = params.moving_mechanism_dovodchik || 0;
  const numMovBelt = params.moving_mechanism_belt_connector || 0;
  const numAdapter = params.adapter_belt || 0;
  const perDoorBrush = params.door_brush_joint || 0;
  const numRubCorner = params.corner_rubber_joint || 0;
  const numRollers = params.bottom_rollers || 0;
  const numFixProf = params.fixed_door_profile || 0;
  const numFixMech = params.fixed_mechanism || 0;
  const widthAdj = params.width_adjustment || 0;

  let raw = (widthFull + widthAdj - 15) / Math.max(1, numDoors);
  let doorWidth = Math.floor(raw);
  if (raw - doorWidth > 0.4) doorWidth += 1;

  const components = [];
  const add = (name, qty, formula) => { if (qty > 0) { const p = prices[name] || 0; components.push({ name, qty, price: p, sum: Math.round(qty * p * 100) / 100, formula }); } };

  add('vertical_profile', (height <= 3200 ? 1 : 2) * numDoors,
      `(${height}<=3200?1:2)*${numDoors}`);
  add('cap_no_brush', (height <= 3200 ? 0.5 : 1) * capNoBrush,
      `(${height}<=3200?0.5:1)*${capNoBrush}`);
  add('cap_with_brush', (height <= 3200 ? 0.5 : 1) * capWithBrush,
      `(${height}<=3200?0.5:1)*${capWithBrush}`);
  add('corner_cap', (height <= 3200 ? 0.5 : 1) * capCorner,
      `(${height}<=3200?0.5:1)*${capCorner}`);
  add('horizontal_profile', (doorWidth <= 1000 ? 1 : 2) * numDoors,
      `(${doorWidth}<=1000?1:2)*${numDoors}`);
  add('glass_seal', Math.ceil(((doorWidth + height) * 2 / 2500) * numDoors),
      `ceil(((${doorWidth}+${height})*2/2500)*${numDoors})`);
  add('bolts', numDoors * 8,
      `${numDoors}*8`);
  add('handles', numHandles,
      `${numHandles}`);
  add('top_rail_rubber', Math.ceil((widthFull * numRails * 2) / 1000),
      `ceil((${widthFull}*${numRails}*2)/1000)`);
  add('door_brush_joint',
      Math.ceil(perDoorBrush * numDoors * height / 1000),
      `ceil(${perDoorBrush}*${numDoors}*${height}/1000)`);
  const railMult = widthFull <= 3000 ? 0.5 : (widthFull <= 6000 ? 1 : (widthFull <= 9000 ? 1.5 : 2));
  const capMult = widthFull <= 3000 ? 1 : (widthFull <= 6000 ? 2 : (widthFull <= 9000 ? 3 : 4));
  add('top_rails', railMult * numRails,
      `${railMult}*${numRails}`);
  add('side_rail_caps_45', railMult * numSideCaps,
      `${railMult}*${numSideCaps}`);
  add('bottom_double_caps', capMult * numBotDbl,
      `${capMult}*${numBotDbl}`);
  add('bottom_single_caps', capMult * numBotSngl,
      `${capMult}*${numBotSngl}`);
  add('rail_to_rail_connectors', Math.ceil(widthFull / 300 * numRRConn),
      `ceil(${widthFull}/300*${numRRConn})`);
  add('rail_to_cap_connectors', Math.ceil(widthFull / 300 * numRCConn),
      `ceil(${widthFull}/300*${numRCConn})`);
  add('metal_rail_aligner', Math.ceil(widthFull / 500 * numRails),
      `ceil(${widthFull}/500*${numRails})`);
  add('plastic_rail_aligner', Math.ceil(widthFull / 500 * numRails * 2),
      `ceil(${widthFull}/500*${numRails}*2)`);
  add('moving_mechanism_dovodchik', numMovDov,
      `${numMovDov}`);
  add('moving_mechanism_belt_connector', numMovBelt,
      `${numMovBelt}`);
  add('adapter_belt', (doorWidth - 12 <= 970 ? 1 : 2) * numAdapter,
      `(${doorWidth}-12<=970?1:2)*${numAdapter}`);
  add('bottom_rollers', numRollers,
      `${numRollers}`);
  add('corner_rubber_joint', Math.ceil(numRubCorner * 2 * height / 1000),
      `ceil(${numRubCorner}*2*${height}/1000)`);
  add('fixed_door_profile', (doorWidth - 12 <= 970 ? 1 : 2) * numFixProf,
      `(${doorWidth}-12<=970?1:2)*${numFixProf}`);
  add('fixed_mechanism', numFixMech,
      `${numFixMech}`);
  add('corner_magnet', 1,
      '1');

  const area = widthFull * height / 1000000;
  const glassPrice = (prices.glass && prices.glass[glass]) || 0;
  components.push({ name: 'glass', qty: area, price: glassPrice, sum: Math.round(area * glassPrice * 100) / 100, formula: `${widthFull}*${height}/1000000` });
  components.push({ name: 'installation', qty: area, price: prices.installation, sum: Math.round(area * prices.installation * 100) / 100, formula: `${widthFull}*${height}/1000000` });
  components.push({ name: 'logistics', qty: 1, price: prices.logistics, sum: prices.logistics, formula: '1' });

  switch (shotlan) {
    case '1шт по горизонтали': {
      const divider = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors;
      add('divider_profile', divider,
          `(${doorWidth}-32<=995?1:2)*${numDoors}`);
      add('additional_glass_seal', divider * 2 * 1000 / 2500,
          `${divider}*2*1000/2500`);
      add('bolts_extra', numDoors * 8,
          `${numDoors}*8`);
      break; }
    case '1шт по вертикали': {
      const divider = (height <= 3000 ? 3 : 4) * numDoors;
      add('divider_profile', divider,
          `(${height}<=3000?3:4)*${numDoors}`);
      add('additional_glass_seal', divider * 2 * 1000 / 2500,
          `${divider}*2*1000/2500`);
      add('bolts_extra', numDoors * 8,
          `${numDoors}*8`);
      break; }
    case '2шт по горизонтали': {
      const divider = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors * 2;
      add('divider_profile', divider,
          `(${doorWidth}-32<=995?1:2)*${numDoors}*2`);
      add('additional_glass_seal', divider * 2 * 1000 / 2500,
          `${divider}*2*1000/2500`);
      add('bolts_extra', numDoors * 16,
          `${numDoors}*16`);
      break; }
    case '1шт по вертикали и 1шт по горизонтали': {
      const vert = (height <= 3200 ? 3 : 4) * numDoors;
      const horiz = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors;
      const divCnt = vert + horiz;
      add('divider_profile', divCnt,
          `${vert}+${horiz}`);
      add('additional_glass_seal', divCnt * 2 * 1000 / 2500,
          `${divCnt}*2*1000/2500`);
      add('bolts_extra', numDoors * 16,
          `${numDoors}*16`);
      break; }
    case '1шт по вертикали и 2шт по горизонтали': {
      const vert = (height <= 3200 ? 3 : 4) * numDoors;
      const horiz = ((doorWidth - 32) <= 995 ? 1 : 2) * 2 * numDoors;
      const divCnt = vert + horiz;
      add('divider_profile', divCnt,
          `${vert}+${horiz}`);
      add('additional_glass_seal', divCnt * 2 * 1000 / 2500,
          `${divCnt}*2*1000/2500`);
      add('bolts_extra', numDoors * 24,
          `${numDoors}*24`);
      break; }
    case '1шт по вертикали и 3шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 3 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh,
          `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*3+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33),
          `ceil(${adh}/33)`);
      break; }
    case '1шт по вертикали и 4шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 4 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh,
          `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*4+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33),
          `ceil(${adh}/33)`);
      break; }
    case '1шт по вертикали и 5шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 5 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh,
          `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*5+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33),
          `ceil(${adh}/33)`);
      break; }
    case 'Очень много разделений': {
      const hBase = (doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3);
      const heightUnits = Math.ceil(height / 40);
      const adh = hBase * heightUnits * 2;
      add('adhesive_profile', adh,
          `${hBase}*${heightUnits}*2`);
      add('tape_33m', Math.ceil(adh / 33),
          `ceil(${adh}/33)`);
      break; }
  }
  let total = 0; components.forEach(c => { total += c.sum; });
  return { components, total, doorWidth };
}

function calculateEmbeddedComponents(widthFull, openWidth, height, subsystem, params, glass, shotlan) {
  const numDoors = params.num_doors || 1;
  let raw;
  switch (subsystem) {
    case '2+0': raw = (openWidth + 17.5 + 16) / numDoors; break;
    case '2+0|2+0': raw = (openWidth + 70 - 15 + 32) / numDoors; break;
    case '1WPUSH': raw = (openWidth - 6) / numDoors; break;
    case '2WPUSH': raw = (openWidth - 6 + 16) / numDoors; break;
    default: raw = openWidth / numDoors;
  }
  let doorWidth = Math.floor(raw);
  if (raw - doorWidth > 0.4) doorWidth += 1;

  const add = (name, qty, formula) => { if (qty > 0) { const p = prices[name] || 0; components.push({ name, qty, price: p, sum: Math.round(qty * p * 100) / 100, formula }); } };
  const components = [];
  add('vertical_profile', (height <= 3200 ? 1 : 2) * numDoors,
      `(${height}<=3200?1:2)*${numDoors}`);
  add('cap_no_brush', (height <= 3200 ? 0.5 : 1) * (params.profile_cap_no_brush || 0),
      `(${height}<=3200?0.5:1)*${params.profile_cap_no_brush || 0}`);
  add('cap_with_brush', (height <= 3200 ? 0.5 : 1) * (params.profile_cap_with_brush || 0),
      `(${height}<=3200?0.5:1)*${params.profile_cap_with_brush || 0}`);
  add('profile_C_cap', (height <= 3200 ? 0.5 : 1) * (params.profile_C_cap || 0),
      `(${height}<=3200?0.5:1)*${params.profile_C_cap || 0}`);
  add('profile_V_cap', (height <= 3200 ? 0.5 : 1) * (params.profile_V_cap || 0),
      `(${height}<=3200?0.5:1)*${params.profile_V_cap || 0}`);
  add('horizontal_profile', (doorWidth <= 1000 ? 1 : 2) * numDoors,
      `(${doorWidth}<=1000?1:2)*${numDoors}`);
  add('glass_seal', Math.ceil(((doorWidth + height) * 2 / 2500) * numDoors),
      `ceil(((${doorWidth}+${height})*2/2500)*${numDoors})`);
  add('bolts', numDoors * 8,
      `${numDoors}*8`);
  add('handles', params.num_handles || 0,
      `${params.num_handles || 0}`);
  add('top_rail_rubber', Math.ceil((widthFull * (params.num_rails || 0) * 2) / 1000),
      `ceil((${widthFull}*${params.num_rails || 0}*2)/1000)`);
  add('door_brush_joint',
      Math.ceil((params.door_brush || 0) * numDoors * height / 1000),
      `ceil((${params.door_brush || 0})*${numDoors}*${height}/1000)`);
  const railMult = widthFull <= 3000 ? 0.5 : (widthFull <= 6000 ? 1 : (widthFull <= 9000 ? 1.5 : 2));
  const capMult = widthFull <= 3000 ? 1 : (widthFull <= 6000 ? 2 : (widthFull <= 9000 ? 3 : 4));
  add('top_rails_41', railMult * (params.num_rails || 0), `${railMult}*${params.num_rails || 0}`);
  add('side_rail_caps_45', railMult * (params.num_side_caps || 0), `${railMult}*${params.num_side_caps || 0}`);
  add('bottom_double_caps', capMult * (params.num_bottom_double_caps || 0), `${capMult}*${params.num_bottom_double_caps || 0}`);
  add('bottom_single_caps', capMult * (params.num_bottom_single_caps || 0), `${capMult}*${params.num_bottom_single_caps || 0}`);
  add('rail_to_rail_connectors', Math.ceil(widthFull / 300 * (params.num_rail_to_rail_connectors || 0)), `ceil(${widthFull}/300*${params.num_rail_to_rail_connectors || 0})`);
  add('rail_to_cap_connectors', Math.ceil(widthFull / 300 * (params.num_rail_to_cap_connectors || 0)), `ceil(${widthFull}/300*${params.num_rail_to_cap_connectors || 0})`);
  add('metal_rail_aligner', Math.ceil(widthFull / 500 * (params.num_rails || 0)), `ceil(${widthFull}/500*${params.num_rails || 0})`);
  add('plastic_rail_aligner', Math.ceil(widthFull / 500 * (params.num_rails || 0) * 2), `ceil(${widthFull}/500*${params.num_rails || 0}*2)`);
  add('moving_mechanism_ci', params.moving_mechanism_ci || 0, `${params.moving_mechanism_ci || 0}`);
  add('belt_connector_mechanism', params.belt_connector_mechanism || 0, `${params.belt_connector_mechanism || 0}`);
  add('belt_adapter', (doorWidth - 12 <= 970 ? 1 : 2) * (params.belt_adapter || 0), `(${doorWidth}-12<=970?1:2)*${params.belt_adapter || 0}`);
  add('bottom_rollers', params.bottom_rollers || 0, `${params.bottom_rollers || 0}`);
  add('gap_rubber', (params.gap_rubber || 0) * 2 * height / 1000, `${params.gap_rubber || 0}*2*${height}/1000`);
  add('push_mechanism', params.push_mechanism || 0, `${params.push_mechanism || 0}`);
  add('gap_base_profile', params.gap_base_profile || 0, `${params.gap_base_profile || 0}`);
  add('gap_basic_cap_profile', params.gap_basic_cap_profile || 0, `${params.gap_basic_cap_profile || 0}`);
  add('gap_deco_cap_profile', params.gap_deco_cap_profile || 0, `${params.gap_deco_cap_profile || 0}`);
  add('inner_support_profile', params.inner_support_profile || 0, `${params.inner_support_profile || 0}`);
  add('corner_rubber_joint', Math.ceil(height * 2 / 1000 * (params.corner_rubber_joint || 0)), `ceil(${height}*2/1000*${params.corner_rubber_joint || 0})`);
  const area = openWidth * height / 1000000;
  const gp = (prices.glass && prices.glass[glass]) || 0;
  components.push({ name: 'glass', qty: area, price: gp, sum: Math.round(area * gp * 100) / 100, formula: `${openWidth}*${height}/1000000` });
  components.push({ name: 'installation', qty: area, price: prices.installation, sum: Math.round(area * prices.installation * 100) / 100, formula: `${openWidth}*${height}/1000000` });
  components.push({ name: 'logistics', qty: 1, price: prices.logistics, sum: prices.logistics, formula: '1' });

  // повторяем формулы шотланок
  switch (shotlan) {
    case '1шт по горизонтали': {
      const d = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors;
      add('divider_profile', d, `(${doorWidth}-32<=995?1:2)*${numDoors}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 8, `${numDoors}*8`);
      break; }
    case '1шт по вертикали': {
      const d = (height <= 3000 ? 3 : 4) * numDoors;
      add('divider_profile', d, `(${height}<=3000?3:4)*${numDoors}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 8, `${numDoors}*8`);
      break; }
    case '2шт по горизонтали': {
      const d = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors * 2;
      add('divider_profile', d, `(${doorWidth}-32<=995?1:2)*${numDoors}*2`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 16, `${numDoors}*16`);
      break; }
    case '1шт по вертикали и 1шт по горизонтали': {
      const v = (height <= 3200 ? 3 : 4) * numDoors;
      const h = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors;
      const d = v + h;
      add('divider_profile', d, `${v}+${h}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 16, `${numDoors}*16`);
      break; }
    case '1шт по вертикали и 2шт по горизонтали': {
      const v = (height <= 3200 ? 3 : 4) * numDoors;
      const h = ((doorWidth - 32) <= 995 ? 1 : 2) * 2 * numDoors;
      const d = v + h;
      add('divider_profile', d, `${v}+${h}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 24, `${numDoors}*24`);
      break; }
    case '1шт по вертикали и 3шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 3 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh, `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*3+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
    case '1шт по вертикали и 4шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 4 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh, `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*4+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
    case '1шт по вертикали и 5шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 5 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh, `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*5+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
    case 'Очень много разделений': {
      const hBase = (doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3);
      const heightUnits = Math.ceil(height / 40);
      const adh = hBase * heightUnits * 2;
      add('adhesive_profile', adh, `${hBase}*${heightUnits}*2`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
  }
  let total = 0; components.forEach(c => { total += c.sum; });
  return { components, total, doorWidth };
}

function calculateSyncComponents(widthFull, height, subsystem, params, glass, shotlan) {
  const numDoors = params.num_doors || 1;
  const numHandles = params.num_handles || 0;
  const numRails = params.num_rails || 0;
  const capNoBrush = params.profile_cap_no_brush || 0;
  const capWithBrush = params.profile_cap_with_brush || 0;
  const capC = params.profile_C_cap || 0;
  const capV = params.profile_V_cap || 0;
  const numSideCaps = params.num_side_caps || 0;
  const numBotDbl = params.num_bottom_double_caps || 0;
  const numBotSngl = params.num_bottom_single_caps || 0;
  const numRRConn = params.num_rail_to_rail_connectors || 0;
  const numRCConn = params.num_rail_to_cap_connectors || 0;
  const numBrush = params.door_brush || 0;
  const movMech = params.moving_mechanism || 0;
  const trosMech = params.moving_mechanism_tros || 0;
  const fixMech = params.fixed_mechanism || 0;
  const fixProf = params.fixed_door_profile || 0;
  const widthAdj = params.width_adjustment || 0;

  let raw = (widthFull + widthAdj - 15) / Math.max(1, numDoors);
  let doorWidth = Math.floor(raw);
  if (raw - doorWidth > 0.4) doorWidth += 1;

  const components = [];
  const add = (name, qty, formula) => { if (qty > 0) { const p = prices[name] || 0; components.push({ name, qty, price: p, sum: Math.round(qty * p * 100) / 100, formula }); } };

  add('vertical_profile', (height <= 3200 ? 1 : 2) * numDoors, `(${height}<=3200?1:2)*${numDoors}`);
  add('cap_no_brush', (height <= 3200 ? 0.5 : 1) * capNoBrush, `(${height}<=3200?0.5:1)*${capNoBrush}`);
  add('cap_with_brush', (height <= 3200 ? 0.5 : 1) * capWithBrush, `(${height}<=3200?0.5:1)*${capWithBrush}`);
  add('profile_C_cap', (height <= 3200 ? 0.5 : 1) * capC, `(${height}<=3200?0.5:1)*${capC}`);
  add('profile_V_cap', (height <= 3200 ? 0.5 : 1) * capV, `(${height}<=3200?0.5:1)*${capV}`);
  add('horizontal_profile', (doorWidth <= 1000 ? 1 : 2) * numDoors, `(${doorWidth}<=1000?1:2)*${numDoors}`);
  add('glass_seal', Math.ceil(((doorWidth + height) * 2 / 2500) * numDoors), `ceil(((${doorWidth}+${height})*2/2500)*${numDoors})`);
  add('bolts', numDoors * 8, `${numDoors}*8`);
  add('handles', numHandles, `${numHandles}`);
  add('top_rail_rubber', Math.ceil((widthFull * numRails * 2) / 1000), `ceil((${widthFull}*${numRails}*2)/1000)`);
  add('door_brush_joint', Math.ceil(numBrush * numDoors * height / 1000), `ceil(${numBrush}*${numDoors}*${height}/1000)`);
  const railMult = widthFull <= 3000 ? 0.5 : (widthFull <= 6000 ? 1 : 1.5);
  const capMult = widthFull <= 3000 ? 1 : (widthFull <= 6000 ? 2 : 3);
  add('top_rails_47', railMult * numRails, `${railMult}*${numRails}`);
  add('side_rail_caps_51', railMult * numSideCaps, `${railMult}*${numSideCaps}`);
  add('bottom_double_caps', capMult * numBotDbl, `${capMult}*${numBotDbl}`);
  add('bottom_single_caps', capMult * numBotSngl, `${capMult}*${numBotSngl}`);
  add('rail_to_rail_connectors', Math.ceil(widthFull / 300 * numRRConn), `ceil(${widthFull}/300*${numRRConn})`);
  add('rail_to_cap_connectors', Math.ceil(widthFull / 300 * numRCConn), `ceil(${widthFull}/300*${numRCConn})`);
  add('metal_rail_aligner', Math.ceil(widthFull / 500 * numRails), `ceil(${widthFull}/500*${numRails})`);
  add('plastic_rail_aligner', Math.ceil(widthFull / 500 * numRails * 2), `ceil(${widthFull}/500*${numRails}*2)`);
  add('moving_mechanism_ci', movMech, `${movMech}`);
  add('moving_mechanism_ct', trosMech, `${trosMech}`);
  add('fixed_mechanism', fixMech, `${fixMech}`);
  add('corner_rubber_joint', Math.ceil(height * 2 / 1000), `ceil(${height}*2/1000)`);
  add('fixed_door_profile', (doorWidth - 12 <= 970 ? 1 : 2) * fixProf, `(${doorWidth}-12<=970?1:2)*${fixProf}`);

  const area = widthFull * height / 1000000;
  const gp = (prices.glass && prices.glass[glass]) || 0;
  components.push({ name: 'glass', qty: area, price: gp, sum: Math.round(area * gp * 100) / 100, formula: `${widthFull}*${height}/1000000` });
  components.push({ name: 'installation', qty: area, price: prices.installation, sum: Math.round(area * prices.installation * 100) / 100, formula: `${widthFull}*${height}/1000000` });
  components.push({ name: 'logistics', qty: 1, price: prices.logistics, sum: prices.logistics, formula: '1' });

  // шотланки
  switch (shotlan) {
    case '1шт по горизонтали': {
      const d = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors;
      add('divider_profile', d, `(${doorWidth}-32<=995?1:2)*${numDoors}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 8, `${numDoors}*8`);
      break; }
    case '1шт по вертикали': {
      const d = (height <= 3000 ? 3 : 4) * numDoors;
      add('divider_profile', d, `(${height}<=3000?3:4)*${numDoors}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 8, `${numDoors}*8`);
      break; }
    case '2шт по горизонтали': {
      const d = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors * 2;
      add('divider_profile', d, `(${doorWidth}-32<=995?1:2)*${numDoors}*2`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 16, `${numDoors}*16`);
      break; }
    case '1шт по вертикали и 1шт по горизонтали': {
      const v = (height <= 3200 ? 3 : 4) * numDoors;
      const h = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors;
      const d = v + h;
      add('divider_profile', d, `${v}+${h}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 16, `${numDoors}*16`);
      break; }
    case '1шт по вертикали и 2шт по горизонтали': {
      const v = (height <= 3200 ? 3 : 4) * numDoors;
      const h = ((doorWidth - 32) <= 995 ? 1 : 2) * 2 * numDoors;
      const d = v + h;
      add('divider_profile', d, `${v}+${h}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 24, `${numDoors}*24`);
      break; }
    case '1шт по вертикали и 3шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 3 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh, `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*3+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
    case '1шт по вертикали и 4шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 4 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh, `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*4+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
    case '1шт по вертикали и 5шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 5 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh, `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*5+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
    case 'Очень много разделений': {
      const hBase = (doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3);
      const heightUnits = Math.ceil(height / 40);
      const adh = hBase * heightUnits * 2;
      add('adhesive_profile', adh, `${hBase}*${heightUnits}*2`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
  }
  let total = 0; components.forEach(c => { total += c.sum; });
  return { components, total, doorWidth };
}

// Данные о системах дверей с ограничениями по размерам
const systemsData = {
  angle: {
    name: 'Угловая система',
    extraField: true,
    minWidth: 1615,
    maxWidth: 6000,
    subsystems: {
      '(1)+1C+1C+(1)': {min: 1615, max: 4500, params: {}},
      '1+2C+2C+1': {min: 2145, max: 6000, params: {}}
    }
  },
  'embedded-wall': {
    name: 'Врезанные в стену двери',
    extraField: true,
    minWidth: 550,
    maxWidth: 6000,
    subsystems: {
      '2+0': {min: 1068, max: 3000, params: {}},
      '2+0|2+0': {min: 2115, max: 6000, params: {}},
      '1WPUSH': {min: 550, max: 1500, params: {}},
      '2WPUSH': {min: 1084, max: 3000, params: {}}
    }
  },
  sync: {
    name: 'Синхронные двери',
    minWidth: 2200,
    maxWidth: 9000,
    subsystems: {
      '(1)+1S+1S+(1)': {min: 2200, max: 6000, params: {}},
      '1+1S+1S+1': {min: 2200, max: 7500, params: {}},
      '(1)+(1)+1S+1S+(1)+(1)': {min: 3350, max: 9000, params: {}}
    }
  },
  cascade: {
    name: 'Каскадные двери',
    minWidth: 1615,
    maxWidth: 12000,
    subsystems: {
      '3+0': {min: 1615, max: 4500, params: {}},
      '4+0': {min: 2145, max: 6000, params: {}},
      '5+0': {min: 2680, max: 6000, params: {}},
      '6+0': {min: 3147, max: 6000, params: {}},
      '7+0': {min: 3745, max: 6000, params: {}},
      '8+0': {min: 4278, max: 6000, params: {}},
      '3+0|3+0': {min: 3230, max: 9000, params: {}},
      '4+0|4+0': {min: 4295, max: 12000, params: {}},
      '5+0|5+0': {min: 5360, max: 12000, params: {}},
      '6+0|6+0': {min: 6425, max: 12000, params: {}},
      '7+0|7+0': {min: 7490, max: 12000, params: {}},
      '8+0|8+0': {min: 8555, max: 12000, params: {}}
    }
  },
  unlinked: {
    name: 'Не связанные двери',
    minWidth: 500,
    maxWidth: 6000,
    subsystems: {
      '(1)': {min: 500, max: 2400, params: {}},
      '1': {min: 500, max: 2400, params: {}},
      '(1)+1': {min: 1000, max: 2400, params: {}},
      '1+1': {min: 1000, max: 2400, params: {}},
      '(1)+1+(1)': {min: 1500, max: 3600, params: {}},
      '1+1+1': {min: 1500, max: 3600, params: {}},
      '(1)+1+1+(1)': {min: 2000, max: 6000, params: {}},
      '1+1+1+1': {min: 2000, max: 6000, params: {}}
    }
  },
  'wall-mounted': {
    name: 'Настенные двери',
    extraField: true,
    minWidth: 500,
    maxWidth: 3000,
    subsystems: {
      'Система 1W': {min: 500, max: 1500, params: {}},
      'Система 1W+1W': {min: 1000, max: 3000, params: {}},
      'Система 1SW+1SW': {min: 1000, max: 3000, params: {}}
    }
  },
  partition: {
    name: 'Стена-перегородка',
    minWidth: 2400,
    maxWidth: 9000,
    subsystems: {
      '(1)+(1)+(1)+1': {min: 2400, max: 6000, params: {}},
      '(1)+(1)+(1)+(1)+1': {min: 3000, max: 7500, params: {}},
      '(1)+(1)+1+1+(1)+(1)': {min: 3600, max: 9000, params: {}}
    }
  }
};

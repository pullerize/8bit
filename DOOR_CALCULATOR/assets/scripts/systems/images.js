// Define all image and video paths for systems, subsystems and options.
// Expose them as a global variable so script.js (loaded as a module)
// can access the data.
const images = {
  systems: {
    angle: './assets/img/angle/2.webm',
    'embedded-wall': './assets/img/embedded-wall/1.webm',
    sync: './assets/img/sync/1.webm',
    cascade: './assets/img/cascade/2.webm',
    unlinked: './assets/img/unlinked/4.webm',
    'wall-mounted': './assets/img/wall-mounted/1.webm',
    partition: './assets/img/partition/1.webm'
  },
  // Для подсистем каждой системы указываем собственные изображения
  subsystems: {
    angle: {
      '(1)+1C+1C+(1)': './assets/img/angle/1.webm',
      '1+2C+2C+1': './assets/img/angle/2.webm'
    },
    'embedded-wall': {
      '2+0': './assets/img/embedded-wall/1.webm',
      '2+0|2+0': './assets/img/embedded-wall/2.webm',
      '1WPUSH': './assets/img/embedded-wall/3.webm',
      '2WPUSH': './assets/img/embedded-wall/4.webm'
    },
    sync: {
      '(1)+1S+1S+(1)': './assets/img/sync/1.webm',
      '1+1S+1S+1': './assets/img/sync/2.webm',
      '(1)+(1)+1S+1S+(1)+(1)': './assets/img/sync/3.webm'
    },
    cascade: {
      '3+0': './assets/img/cascade/1.webm',
      '4+0': './assets/img/cascade/2.webm',
      '3+0|3+0': './assets/img/cascade/3.webm',
      '4+0|4+0': './assets/img/cascade/4.webm',
      '5+0': './assets/img/cascade/5.webm',
      '6+0': './assets/img/cascade/6.webm',
      '7+0': './assets/img/cascade/7.webm',
      '8+0': './assets/img/cascade/8.webm',
      '5+0|5+0': './assets/img/cascade/9.webm',
      '6+0|6+0': './assets/img/cascade/10.webm',
      '7+0|7+0': './assets/img/cascade/11.webm',
      '8+0|8+0': './assets/img/cascade/12.webm'
    },
    unlinked: {
      '(1)': './assets/img/unlinked/1.webm',
      '1': './assets/img/unlinked/2.webm',
      '(1)+1': './assets/img/unlinked/3.webm',
      '1+1': './assets/img/unlinked/4.webm',
      '(1)+1+(1)': './assets/img/unlinked/5.webm',
      '1+1+1': './assets/img/unlinked/6.webm',
      '(1)+1+1+(1)': './assets/img/unlinked/7.webm',
      '1+1+1+1': './assets/img/unlinked/8.webm'
    },
    'wall-mounted': {
      'Система 1W': './assets/img/wall-mounted/1.webm',
      'Система 1W+1W': './assets/img/wall-mounted/2.webm',
      'Система 1SW+1SW': './assets/img/wall-mounted/3.webm'
    },
    partition: {
      '(1)+(1)+(1)+1': './assets/img/partition/1.webm',
      '(1)+(1)+(1)+(1)+1': './assets/img/partition/2.webm',
      '(1)+(1)+1+1+(1)+(1)': './assets/img/partition/3.webm'
    }
  },
  glass: {
    'Прозрачное': './assets/img/glass/1.webp',
    'Пепельное': './assets/img/glass/2.webp',
    'Йодовое': './assets/img/glass/3.webp',
    'Рифленое': './assets/img/glass/4.webp',
    'Зеркальное': './assets/img/glass/5.webp',
    'Гравированное': './assets/img/glass/6.webp'
  },
  shotlan: {
    'Без шотланок': './assets/img/shotlan/none.webp',
    '1шт по горизонтали': './assets/img/shotlan/1.webp',
    '2шт по горизонтали': './assets/img/shotlan/2.webp',
    '1шт по вертикали': './assets/img/shotlan/3.webp',
    '1шт по вертикали и 1шт по горизонтали': './assets/img/shotlan/4.webp',
    '1шт по вертикали и 2шт по горизонтали': './assets/img/shotlan/5.webp',
    '1шт по вертикали и 3шт по горизонтали': './assets/img/shotlan/6.webp',
    '1шт по вертикали и 4шт по горизонтали': './assets/img/shotlan/7.webp',
    '1шт по вертикали и 5шт по горизонтали': './assets/img/shotlan/8.webp',
    'Очень много разделений': './assets/img/shotlan/9.webp'
  },
  // Изображения для подсказок по размерам
   tooltips: {
    angle: {
      width: './assets/img/help/1.png',
      height: './assets/img/help/1.png',
      open: './assets/img/help/1.png'
    },
    'embedded-wall': {
      width: './assets/img/help/2.png',
      height: './assets/img/help/2.png',
      open: './assets/img/help/2.png'
    },
    sync: {
      width: './assets/img/help/1.png',
      height: './assets/img/help/1.png'
    },
    cascade: {
      width: './assets/img/help/1.png',
      height: './assets/img/help/1.png'
    },
    unlinked: {
      width: './assets/img/help/1.png',
      height: './assets/img/help/1.png'
    },
    'wall-mounted': {
      width: './assets/img/help/3.png',
      height: './assets/img/help/3.png',
      open: './assets/img/help/3.png'
    },
    partition: {
      width: './assets/img/help/1.png',
      height: './assets/img/help/1.png'
    }
  }
};

// Make available on the window object so module scripts can read it
// without needing an import statement.
window.images = images;

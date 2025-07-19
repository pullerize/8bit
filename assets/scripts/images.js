// Файл для подключения изображений систем и параметров
// Замените пути к файлам на свои гифы или картинки,
// размещённые в каталоге assets/img

const images = {
  systems: {
    angle: './assets/img/angle.mp4',
    'embedded-wall': './assets/img/embedded-wall.mp4',
    sync: './assets/img/sync.mp4',
    cascade: './assets/img/cascade.mp4',
    unlinked: './assets/img/unlinked.mp4',
    'wall-mounted': './assets/img/wall-mounted.mp4',
    partition: './assets/img/partition.mp4'
  },
  // Для подсистем каждой системы указываем собственные изображения
  subsystems: {
    angle: {
      '(1)+1C+1C+(1)': './assets/img/subsystems/angle-1.mp4',
      '1+2C+2C+1': './assets/img/subsystems/angle-2.mp4'
    },
    'embedded-wall': {
      '2+0': './assets/img/subsystems/embedded-2+0.mp4',
      '2+0|2+0': './assets/img/subsystems/embedded-2+0-2+0.mp4',
      '1WPUSH': './assets/img/subsystems/embedded-1wpush.mp4',
      '2WPUSH': './assets/img/subsystems/embedded-2wpush.mp4'
    },
    sync: {
      '(1)+1S+1S+(1)': './assets/img/subsystems/sync-a.mp4',
      '1+1S+1S+1': './assets/img/subsystems/sync-b.mp4',
      '(1)+(1)+1S+1S+(1)+(1)': './assets/img/subsystems/sync-c.mp4'
    },
    cascade: {
      '3+0': './assets/img/subsystems/cascade-3+0.mp4',
      '4+0': './assets/img/subsystems/cascade-4+0.mp4',
      '5+0': './assets/img/subsystems/cascade-5+0.mp4',
      '6+0': './assets/img/subsystems/cascade-6+0.mp4',
      '7+0': './assets/img/subsystems/cascade-7+0.mp4',
      '8+0': './assets/img/subsystems/cascade-8+0.mp4',
      '3+0|3+0': './assets/img/subsystems/cascade-3+0-3+0.mp4',
      '4+0|4+0': './assets/img/subsystems/cascade-4+0-4+0.mp4',
      '5+0|5+0': './assets/img/subsystems/cascade-5+0-5+0.mp4',
      '6+0|6+0': './assets/img/subsystems/cascade-6+0-6+0.mp4',
      '7+0|7+0': './assets/img/subsystems/cascade-7+0-7+0.mp4',
      '8+0|8+0': './assets/img/subsystems/cascade-8+0-8+0.mp4'
    },
    unlinked: {
      '(1)': './assets/img/subsystems/unlinked-1.mp4',
      '1': './assets/img/subsystems/unlinked-1b.mp4',
      '(1)+1': './assets/img/subsystems/unlinked-1+1a.mp4',
      '1+1': './assets/img/subsystems/unlinked-1+1b.mp4',
      '(1)+1+(1)': './assets/img/subsystems/unlinked-1+1+1a.mp4',
      '1+1+1': './assets/img/subsystems/unlinked-1+1+1b.mp4',
      '(1)+1+1+(1)': './assets/img/subsystems/unlinked-1+1+1+1a.mp4',
      '1+1+1+1': './assets/img/subsystems/unlinked-1+1+1+1b.mp4'
    },
    'wall-mounted': {
      'Система 1W': './assets/img/subsystems/wall-1w.mp4',
      'Система 1W+1W': './assets/img/subsystems/wall-1w1w.mp4',
      'Система 1SW+1SW': './assets/img/subsystems/wall-1sw1sw.mp4'
    },
    partition: {
      '(1)+(1)+(1)+1': './assets/img/subsystems/part-111+1.mp4',
      '(1)+(1)+(1)+(1)+1': './assets/img/subsystems/part-1111+1.mp4',
      '(1)+(1)+1+1+(1)+(1)': './assets/img/subsystems/part-11+11+11.mp4'
    }
  },
  glass: {
    'Прозрачное': './assets/img/glass/transparent.gif',
    'Пепельное': './assets/img/glass/grey.gif',
    'Йодовое': './assets/img/glass/iod.gif',
    'Рифленое': './assets/img/glass/riffled.gif',
    'Зеркальное': './assets/img/glass/mirror.gif',
    'Гравированное': './assets/img/glass/engraved.gif'
  },
  shotlan: {
    'Без шотланок': './assets/img/shotlan/none.gif',
    '1шт по горизонтали': './assets/img/shotlan/h1.gif',
    '2шт по горизонтали': './assets/img/shotlan/h2.gif',
    '1шт по вертикали': './assets/img/shotlan/v1.gif',
    '1шт по вертикали и 1шт по горизонтали': './assets/img/shotlan/v1h1.gif',
    '1шт по вертикали и 2шт по горизонтали': './assets/img/shotlan/v1h2.gif',
    '1шт по вертикали и 3шт по горизонтали': './assets/img/shotlan/v1h3.gif',
    '1шт по вертикали и 4шт по горизонтали': './assets/img/shotlan/v1h4.gif',
    '1шт по вертикали и 5шт по горизонтали': './assets/img/shotlan/v1h5.gif',
    'Очень много разделений': './assets/img/shotlan/many.gif'
  },
  // Изображения для подсказок по размерам
  tooltips: {
    // Для всех систем используются единые изображения подсказок.
    // Файлы располагаются по путям ./assets/img/help/1.png (ширина),
    // ./assets/img/help/2.png (высота) и ./assets/img/help/3.png (открытая часть)
    angle: { width: './assets/img/help/1.png', height: './assets/img/help/2.png', open: './assets/img/help/3.png' },
    'embedded-wall': { width: './assets/img/help/1.png', height: './assets/img/help/2.png', open: './assets/img/help/3.png' },
    sync: { width: './assets/img/help/1.png', height: './assets/img/help/2.png' },
    cascade: { width: './assets/img/help/1.png', height: './assets/img/help/2.png' },
    unlinked: { width: './assets/img/help/1.png', height: './assets/img/help/2.png' },
    'wall-mounted': { width: './assets/img/help/1.png', height: './assets/img/help/2.png', open: './assets/img/help/3.png' },
    partition: { width: './assets/img/help/1.png', height: './assets/img/help/2.png' }
  }
};

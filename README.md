# Калькулятор дверных систем

Небольшое одностраничное приложение для расчёта стоимости семи типов дверных систем.
Подробные формулы расчёта реализованы для систем «Каскадные двери» и «Двери с угловым примыканием».
Стили и скрипты расположены в каталоге `assets`. Конфигурации отдельных систем
хранятся в подпапке `assets/scripts/systems`, что облегчает поддержку и
добавление новых вариантов. Значки систем и подсистем теперь представлены
короткими видеороликами (файлы `.mp4`). Пути к ним задаются в файле
`assets/scripts/images.js`. Там же можно указать изображения‑подсказки для
ширины, высоты и других параметров каждой системы. Поместите необходимые
файлы в каталог `assets/img` и пропишите их имена в этом файле. При наведении
на значок «?» картинка подсказки отображается размером 600×600 пикселей, а при
клике открывается в полном размере в новой вкладке браузера. На мобильных
устройствах изображение выводится по центру и занимает около 90 % ширины экрана.
В репозитории уже есть примеры подсказок в каталогe ./assets/img/help (1.png, 2.png, 3.png) для ширины, высоты и открытой части.
Основной акцентный цвет интерфейса — `#162832`, выбранные пункты подсвечиваются белым текстом на этом фоне.

## Запуск

1. В каталоге проекта запустите простой веб‑сервер. Проще всего сделать это с помощью Python:
   ```bash
   python3 -m http.server
   ```
2. Откройте браузер по адресу [http://localhost:8000/saga_calculator.html](http://localhost:8000/saga_calculator.html) или используйте порт, указанный в консоли.

## Использование

- Нажмите на нужную систему в главном меню.
- Заполните параметры ширины и высоты проёма (ползунок синхронизирован с числовым полем).
- При необходимости введите ширину открытой части.
- Выберите стекло и вариант шотланок.
- Нажмите **Рассчитать**, чтобы увидеть таблицу со списком расходных материалов и итоговой стоимостью. Полученную таблицу можно сохранить в PDF кнопкой **Скачать**.

Все поля обязательны. Если для указанной ширины не найдено подходящей подсистемы, выводится сообщение об ошибке.

## Формулы для системы «Не связанные двери»

При расчёте этой системы используются следующие зависимости (где `height` — высота проёма в мм, `doorWidth` — рассчитанная ширина одной двери, `widthFull` — полная ширина проёма):

```
vertical_profile    = (height <= 3200 ? 1 : 2) * num_doors
cap_no_brush        = (height <= 3200 ? 0.5 : 1) * profile_cap_no_brush
cap_with_brush      = (height <= 3200 ? 0.5 : 1) * profile_cap_with_brush
profile_C_cap       = (height <= 3200 ? 0.5 : 1) * profile_C_cap
profile_V_cap       = (height <= 3200 ? 0.5 : 1) * profile_V_cap
horizontal_profile  = (doorWidth <= 1000 ? 1 : 2) * num_doors
fixed_door_profile  = (doorWidth - 12 <= 970 ? 1 : 2) * fixed_door_profile
glass_seal          = ceil(((doorWidth + height) * 2 / 2500) * num_doors)
bolts               = num_doors * 8
handles             = num_handles
top_rail_rubber     = ceil((widthFull * num_rails * 2) / 1000)
door_brush_joint    = ceil(door_brush * num_doors * height / 1000)
top_rails_41        = (widthFull <= 3000 ? 0.5 : 1) * num_rails
side_rail_caps_45   = (widthFull <= 3000 ? 0.5 : 1) * num_side_caps
bottom_double_caps  = (widthFull <= 3000 ? 1 : 2) * num_bottom_double_caps
bottom_single_caps  = (widthFull <= 3000 ? 1 : 2) * num_bottom_single_caps
rail_to_rail_connectors = ceil((widthFull / 300) * num_rail_to_rail_connectors)
rail_to_cap_connectors  = ceil((widthFull / 300) * num_rail_to_cap_connectors)
metal_rail_aligner      = ceil((widthFull / 500) * num_rails)
plastic_rail_aligner    = ceil((widthFull / 500) * num_rails * 2)
moving_mechanism        = moving_mechanism
fixed_mechanism         = fixed_mechanism
```

Количество умножается на цену компонента из прайса, после чего суммируются все позиции с итоговой стоимостью больше нуля.


## Формулы для системы «Врезанные в стену двери»

Ширина одной двери зависит от подсистемы и ширины открытой части `widthOpen`:

```
if subsystem == '2+0':
    doorWidthRaw = (widthOpen + 17.5 + 16) / num_doors
elif subsystem == '2+0|2+0':
    doorWidthRaw = (widthOpen + 70 - 15 + 32) / num_doors
elif subsystem == '1WPUSH':
    doorWidthRaw = (widthOpen - 6) / num_doors
elif subsystem == '2WPUSH':
    doorWidthRaw = (widthOpen - 6 + 16) / num_doors
```

После округления по тем же правилам (`>0.4` — вверх) расчёт компонентов ведётся по формулам:

```
vertical_profile    = (height <= 3200 ? 1 : 2) * num_doors
cap_no_brush        = (height <= 3200 ? 0.5 : 1) * profile_cap_no_brush
cap_with_brush      = (height <= 3200 ? 0.5 : 1) * profile_cap_with_brush
profile_C_cap       = (height <= 3200 ? 0.5 : 1) * profile_C_cap
profile_V_cap       = (height <= 3200 ? 0.5 : 1) * profile_V_cap
horizontal_profile  = (doorWidth <= 1000 ? 1 : 2) * num_doors
glass_seal          = ceil(((doorWidth + height) * 2 / 2500) * num_doors)
bolts               = num_doors * 8
handles             = num_handles
top_rail_rubber     = ceil((widthFull * num_rails * 2) / 1000)
door_brush_joint    = ceil(door_brush * num_doors * height / 1000)
rail_to_rail_connectors = ceil(widthFull / 300 * num_rail_to_rail_connectors)
rail_to_cap_connectors  = ceil(widthFull / 300 * num_rail_to_cap_connectors)
metal_rail_aligner      = ceil(widthFull / 500 * num_rails)
plastic_rail_aligner    = ceil(widthFull / 500 * num_rails * 2)
move_mech_ci            = moving_mechanism_ci
belt_connector_mechanism= belt_connector_mechanism
belt_adapter            = (doorWidth - 12 <= 970 ? 1 : 2) * belt_adapter
bottom_rollers          = bottom_rollers
gap_rubber              = gap_rubber * 2 * height / 1000
push_mechanism          = push_mechanism
gap_base_profile        = gap_base_profile
gap_basic_cap_profile   = gap_basic_cap_profile
gap_deco_cap_profile    = gap_deco_cap_profile
inner_support_profile   = inner_support_profile
corner_rubber_joint     = ceil(height * 2 / 1000 * corner_rubber_joint)
```

Площадь стекла рассчитывается как `widthOpen * height / 1_000_000`. Установка и логистика считаются по той же площади.

## Формулы для системы «Синхронные двери»

Ширина одной двери:

```
$doorWidthRaw = ($widthFull + 32 - 15) / max(1, $numDoors)
$floor = floor($doorWidthRaw)
$doorWidth = ($doorWidthRaw - $floor > 0.4) ? $floor + 1 : $floor
```

Расчёт комплектующих:

```
vertical_profile    = (height <= 3200 ? 1 : 2) * numDoors
cap_no_brush        = (height <= 3200 ? 0.5 : 1) * capNoBrush
cap_with_brush      = (height <= 3200 ? 0.5 : 1) * capWithBrush
profile_C_cap       = (height <= 3200 ? 0.5 : 1) * capC
profile_V_cap       = (height <= 3200 ? 0.5 : 1) * capV
horizontal_profile  = (doorWidth <= 1000 ? 1 : 2) * numDoors
glass_seal          = ceil(((doorWidth + height) * 2 / 2500) * numDoors)
bolts               = numDoors * 8
handles             = numHandles
top_rail_rubber     = ceil((widthFull * numRails * 2) / 1000)
door_brush_joint    = ceil(numBrush * numDoors * height / 1000)

$railMult = widthFull <= 3000 ? 0.5 : (widthFull <= 6000 ? 1 : 1.5)
$capMult  = widthFull <= 3000 ? 1   : (widthFull <= 6000 ? 2 : 3)

top_rails_47        = $railMult * numRails
side_rail_caps_51   = $railMult * numSideCaps
bottom_double_caps  = $capMult  * numBotDbl
bottom_single_caps  = $capMult  * numBotSngl
rail_to_rail_connectors = ceil(widthFull / 300 * numRRConn)
rail_to_cap_connectors  = ceil(widthFull / 300 * numRCConn)
metal_rail_aligner      = ceil(widthFull / 500 * numRails)
plastic_rail_aligner    = ceil(widthFull / 500 * numRails * 2)
moving_mechanism_ci     = movMech
moving_mechanism_ct     = trosMech
fixed_mechanism         = fixMech
corner_rubber_joint     = ceil(height * 2 / 1000)
fixed_door_profile      = ((doorWidth - 12) <= 970 ? 1 : 2) * fixProf
```

Площадь стекла и монтаж рассчитываются по формуле `area = widthFull * height / 1_000_000`.

## Формулы для системы «Стена‑перегородка»

Ширина одной двери зависит от выбранной схемы подсистемы. Сначала из её названия убираются скобки и плюсы:

```
$subsystemClear = str_replace(['(', ')', '+', ' '], '', $subsystem);
switch ($subsystemClear) {
    case '1111':
        $doorWidthRaw = ($widthFull + 16) / max(1, $numDoors);
        break;
    case '11111':
        $doorWidthRaw = ($widthFull + 16) / max(1, $numDoors);
        break;
    case '111111':
        $doorWidthRaw = ($widthFull + 32 - 15) / max(1, $numDoors);
        break;
}
$floor = floor($doorWidthRaw);
$doorWidth = ($doorWidthRaw - $floor > 0.4) ? $floor + 1 : $floor;
```

Количество материалов считается так:

```
vertical_profile    = (height <= 3200 ? 1 : 2) * numDoors
cap_no_brush        = (height <= 3200 ? 0.5 : 1) * capNoBrush
cap_with_brush      = (height <= 3200 ? 0.5 : 1) * capWithBrush
profile_C_cap       = (height <= 3200 ? 0.5 : 1) * capC
profile_V_cap       = (height <= 3200 ? 0.5 : 1) * capV
horizontal_profile  = (doorWidth <= 1000 ? 1 : 2) * numDoors
bolts               = numDoors * 8
handles             = numHandles
glass_seal          = ceil(((doorWidth + height) * 2 / 2500) * numDoors)
top_rail_rubber     = ceil((widthFull * numRails * 2) / 1000)
door_brush_joint    = ceil(doorBrush * numDoors * height / 1000)
multR = widthFull <= 3000 ? 0.5 : (widthFull <= 6000 ? 1 : (widthFull <= 9000 ? 1.5 : 2))
top_rails           = multR * numRails
side_rail_caps_45   = multR * numSideCaps
capMult = widthFull <= 3000 ? 1 : (widthFull <= 6000 ? 2 : (widthFull <= 9000 ? 3 : 4))
bottom_double_caps  = capMult * numBotDbl
bottom_single_caps  = capMult * numBotSngl
rail_to_rail_connectors = ceil(widthFull / 300 * numRRConn)
rail_to_cap_connectors  = ceil(widthFull / 300 * numRCConn)
metal_rail_aligner      = ceil(widthFull / 500 * numRails)
plastic_rail_aligner    = ceil(widthFull / 500 * numRails * 2)
moving_mechanism        = movMech
fixed_mechanism         = fixMech
fixed_door_profile      = fixProf
corner_rubber_joint     = ceil(height * 2 / 1000)
```

Площадь стекла считается как `area = widthFull * height / 1_000_000`. Стоимость монтажа и логистики умножается на эту площадь.

## Формулы для системы «Настенные двери»

### Ширина одной двери

```
Система 1W:      (openWidth + 16) / num_doors
Система 1W+1W:   (openWidth + 32) / num_doors
Система 1SW+1SW: (openWidth + 32 - 15) / num_doors
```
Округление как обычно: если дробная часть больше 0.4, размер увеличивается на 1 мм.

### Основные комплектующие

```
vertical_profile       = (height <= 3200 ? 1 : 2) * num_doors
cap_no_brush           = (height <= 3200 ? 0.5 : 1) * profile_cap_no_brush
profile_C_cap          = (height <= 3200 ? 0.5 : 1) * profile_C_cap
profile_V_cap          = (height <= 3200 ? 0.5 : 1) * profile_V_cap
horizontal_profile     = (doorWidth <= 1000 ? 1 : 2) * num_doors
glass_seal             = ceil(((doorWidth + height) * 2 / 2500) * num_doors)
top_rail_rubber        = ceil((widthFull * num_rails_41 * 2) / 1000)
door_brush_joint       = ceil(door_brush * num_doors * height / 1000)
railMult               = widthFull <= 3000 ? 0.5 : 1
capMult                = widthFull <= 3000 ? 1 : 2
top_rails_41           = railMult * num_rails_41
top_rails_47           = railMult * num_rails_47
side_rail_caps_45      = railMult * num_side_caps_45
side_rail_caps_51      = railMult * num_side_caps_51
bottom_single_caps     = capMult * num_bottom_single_caps
rail_to_cap_connectors = ceil(widthFull / 300 * num_rail_to_cap_connectors)
rail_to_rail_connectors= num_rail_to_rail_connectors
metal_rail_aligner     = ceil(widthFull / 500 * num_rails_41)
plastic_rail_aligner   = ceil(widthFull / 500 * num_rails_41 * 2)
wall_connector        = ceil(widthFull / 400)
corner_rubber_joint    = ceil(corner_rubber_joint * 2 * height / 1000)
```

Площадь стекла и монтаж рассчитываются по формуле `area = openWidth * height / 1_000_000`.

### Пример конфигурации подсистем

```json
{
  "Система 1W": {
    "num_doors": 1,
    "num_rails_41": 1,
    "num_side_caps_45": 2,
    "num_bottom_single_caps": 2,
    "num_rrconn": 0,
    "num_rcconn": 6,
    "num_handles": 2,
    "profile_cap_no_brush": 2,
    "profile_C_cap": 0,
    "profile_V_cap": 0,
    "n_ci": 1,
    "n_ct": 0,
    "num_rails_47": 0,
    "num_side_caps_51": 0,
    "corner_rubber_joint": 0,
    "door_width_offset": 16
  }
}
```

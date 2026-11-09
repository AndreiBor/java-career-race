(function () {
  'use strict';
  const root = document.getElementById('jg-career-game');
  if (!root || root.dataset.initialized === 'true') return;
  root.dataset.initialized = 'true';
  const $ = id => root.querySelector('#' + id);
  const W = 1120, H = 620, MONTH_SECONDS = 5;
  const DIFFICULTIES = {
    easy:   {label:'Легко', goal:1000000,   cost:100000, start:300000},
    normal: {label:'Нормально', goal:5000000, cost:250000, start:750000},
    hard:   {label:'Трудно', goal:100000000, cost:500000, start:1500000}
  };
  const fmt = n => Math.round(n).toLocaleString('ru-RU') + ' ₽';
  const clamp = (v,low,high) => Math.max(low,Math.min(high,v));
  const rand = (a,b) => a+Math.random()*(b-a);
  const sample = a => a[Math.floor(Math.random()*a.length)];
  const safe = s => String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const companies = [
    {id:'sber',name:'Сбер',accent:'#21cf8b',x:200,y:113,jobs:[]},
    {id:'yandex',name:'Яндекс',accent:'#fc8178',x:560,y:113,jobs:[]},
    {id:'tbank',name:'Т-Банк',accent:'#efd174',x:914,y:113,jobs:[]},
    {id:'vtb',name:'ВТБ',accent:'#73bbf5',x:200,y:260,jobs:[]},
    {id:'aston',name:'Астон',accent:'#c2a9fa',x:560,y:260,jobs:[]},
    {id:'alfa',name:'Альфа-Банк',accent:'#fa858c',x:914,y:260,jobs:[]},
    {id:'gazprom',name:'Газпромбанк',accent:'#76b8f2',x:200,y:400,jobs:[]},
    {id:'intech',name:'Интех',accent:'#c9c9f4',x:560,y:400,jobs:[]},
    {id:'vk',name:'VK',accent:'#85bbff',x:914,y:400,jobs:[]},
    {id:'x5',name:'X5',accent:'#99eb9d',x:143,y:539,jobs:[]},
    {id:'ozon',name:'Ozon',accent:'#82a8fa',x:415,y:539,jobs:[]},
    {id:'wb',name:'Wildberries',accent:'#cc91ea',x:690,y:539,jobs:[]},
    {id:'t1',name:'T1',accent:'#f1b581',x:965,y:539,jobs:[]}
  ];
  const ROLES = [
    {id:'middle', label:'Middle', roleName:'Middle Java', min:160000,max:250000, weight:.36,questions:1, rank:1},
    {id:'middleplus',label:'Middle+',roleName:'Middle+ Java',min:250000,max:350000,weight:.30,questions:2,rank:2},
    {id:'senior',label:'Senior',roleName:'Senior Java',min:350000,max:500000,weight:.25,questions:3,rank:3},
    {id:'lead',label:'Tech Lead',roleName:'Java Tech Lead',min:500000,max:1000000,weight:.09,questions:4,rank:4}
  ];
  const originalQuestions = [
    {lv:'middle',q:'Что произойдёт при вызове add() у List.of("a", "b")?',a:['Добавится третий элемент','Будет UnsupportedOperationException','Вернётся false','Создастся новый список'],ok:1,why:'List.of() возвращает неизменяемый список.'},
    {lv:'middle',q:'Что гарантирует ключевое слово volatile для поля?',a:['Атомарность i++','Видимость изменений между потоками','Порядок элементов в коллекции','Защиту от взаимных блокировок'],ok:1,why:'volatile гарантирует видимость и определённые правила упорядочивания, но не делает i++ атомарным.'},
    {lv:'middle',q:'Что верно для контрактов equals() и hashCode()?',a:['Разные объекты обязаны иметь разный hashCode','Равные объекты обязаны иметь одинаковый hashCode','hashCode всегда уникален','equals не связан с hashCode'],ok:1,why:'Если equals() вернул true, hashCode() обязан быть одинаковым.'},
    {lv:'middle',q:'equals() всегда false, hashCode() константный. Сколько разных объектов примет HashSet?',a:['Один','Ноль','Все объекты','Возникнет исключение'],ok:2,why:'При разных объектах и equals() == false Set сохранит все, несмотря на коллизии хэша.'},
    {lv:'middle',q:'Что произойдёт при put("k", null) в ConcurrentHashMap?',a:['Запишется null','Значение будет удалено','Будет NullPointerException','Операция проигнорируется'],ok:2,why:'ConcurrentHashMap запрещает null-ключи и null-значения.'},
    {lv:'middle',q:'Какой HTTP-статус означает Too Many Requests?',a:['401','409','429','503'],ok:2,why:'429 — ограничение частоты запросов (rate limiting).'},
    {lv:'middle',q:'Что означает Mono<T> в Project Reactor?',a:['Ровно два значения','Ноль или одно значение','Неограниченный поток значений','Только блокирующий ответ'],ok:1,why:'Mono представляет асинхронный результат из 0 или 1 элемента.'},
    {lv:'middle',q:'Какой метод контроллера обычно обрабатывает HTTP POST?',a:['@GetMapping','@DeleteMapping','@PostMapping','@PutMapping'],ok:2,why:'@PostMapping связывает метод контроллера с HTTP POST.'},
    {lv:'middle',q:'Что произойдёт при вызове String.concat()?',a:['Исходная строка изменится','Вернётся новая строка','Метод всегда выбросит ошибку','Строка будет удалена'],ok:1,why:'String в Java неизменяемый; concat возвращает новую строку.'},
    {lv:'middle',q:'Какая структура данных обычно лежит в основе индекса B-tree в PostgreSQL?',a:['Хэш-таблица','Сбалансированное дерево','Стек','Очередь'],ok:1,why:'B-tree — сбалансированная древовидная структура для поиска и диапазонов.'},
    {lv:'middle',q:'Какое исключение обычно вызывает обращение к LAZY-связи вне Hibernate Session?',a:['ClassCastException','LazyInitializationException','OutOfMemoryError','NumberFormatException'],ok:1,why:'Неинициализированная ленивaя связь требует активного persistence context.'},
    {lv:'middle',q:'Что в Kubernetes проверяет readinessProbe?',a:['Готовность Pod принимать трафик','Свободное место на диске ноды','Версию образа','Количество реплик Deployment'],ok:0,why:'readinessProbe помогает исключить неготовый Pod из Service endpoints.'},
    {lv:'middle',q:'Какая коллекция не гарантирует порядок обхода элементов?',a:['ArrayList','LinkedList','HashSet','LinkedHashSet'],ok:2,why:'HashSet не гарантирует порядок итерации.'},
    {lv:'senior',q:'Почему @Transactional может не сработать при вызове метода внутри того же Spring-бина?',a:['Из-за отсутствия HTTP','Вызов обходит Spring proxy','Из-за неправильного SQL','Из-за JVM Garbage Collector'],ok:1,why:'При стандартном proxy-based AOP self-invocation не проходит через транзакционный прокси.'},
    {lv:'senior',q:'Что даёт Transactional Outbox при записи заказа и события?',a:['Глобальную ACID-транзакцию','Атомарную запись в одну БД','Exactly-once доставку в Kafka','Отказ от повторных обработок'],ok:1,why:'Данные заказа и outbox-событие пишутся в одной локальной транзакции; доставка события отдельно.'},
    {lv:'senior',q:'Сколько Kafka consumer в одной группе реально читают параллельно топик с 4 партициями?',a:['Не более 4','Всегда ровно 8','Не ограничено','Не более 1'],ok:0,why:'В пределах одной consumer group одну партицию читает только один consumer одновременно.'},
    {lv:'senior',q:'Что обычно означает at-least-once доставка сообщений?',a:['Дубликаты невозможны','Возможна повторная обработка','Потери гарантированы','Порядок глобально строгий'],ok:1,why:'При повторной доставке возможны дубликаты, поэтому обработчик часто делают идемпотентным.'},
    {lv:'senior',q:'Какая проблема решается оптимистической блокировкой @Version?',a:['Конфликт конкурентных обновлений','Отсутствие индексов','Потери DNS-запросов','Нехватка памяти JVM'],ok:0,why:'Счётчик версии позволяет обнаружить конкурентное изменение записи.'},
    {lv:'senior',q:'Что означает идемпотентность операции?',a:['Операция выполняется параллельно','Повторный вызов не меняет результат сверх первого','Операция всегда быстрая','Операция никогда не завершится ошибкой'],ok:1,why:'Повторение операции имеет тот же эффект на состояние, что и одно применение.'},
    {lv:'senior',q:'Что делает Circuit Breaker при массовых ошибках внешнего сервиса?',a:['Увеличивает таймаут бесконечно','Временно блокирует новые вызовы','Удаляет сообщения Kafka','Перезаписывает кэш'],ok:1,why:'Открытый Circuit Breaker быстро отклоняет вызовы, снижая нагрузку на проблемную зависимость.'},
    {lv:'senior',q:'Как в Cache Aside обычно заполняется кэш?',a:['База сама отправляет все записи','Приложение читает БД при cache miss','Kafka хранит все ключи','Кэш напрямую переписывает SQL'],ok:1,why:'При промахе приложение загружает данные из БД и кладёт их в кэш.'},
    {lv:'senior',q:'Что предотвращает уровень изоляции READ COMMITTED?',a:['Фантомные чтения','Грязные чтения','Все lost update','Любые дедлоки'],ok:1,why:'READ COMMITTED исключает чтение незакоммиченных данных; другие аномалии возможны.'},
    {lv:'senior',q:'Что обычно делает Kubernetes HPA?',a:['Меняет количество реплик приложения','Меняет файловую систему Pod','Шифрует Kubernetes Secrets','Создаёт индексы PostgreSQL'],ok:0,why:'Horizontal Pod Autoscaler изменяет число реплик по метрикам и политике масштабирования.'},
    {lv:'senior',q:'Какой механизм чаще используют для обратной связи от медленного потребителя в Reactive Streams?',a:['Backpressure','Polling без лимитов','Глобальную блокировку JVM','Принудительный GC'],ok:0,why:'Backpressure позволяет подписчику регулировать спрос (request(n)).'},
    {lv:'senior',q:'Что означает Saga в распределённом бизнес-процессе?',a:['Одна SQL-транзакция на все сервисы','Цепочка локальных транзакций с компенсациями','Общая память между сервисами','Блокировка всех таблиц'],ok:1,why:'Saga координирует локальные транзакции и при сбое выполняет компенсирующие действия.'},
    {lv:'lead',q:'Kafka offset коммитится только после бизнес-обработки. Какой риск остаётся?',a:['Потеря всех сообщений','Повторная обработка при сбое до коммита','Запрет на масштабирование','Невозможность читать партиции'],ok:1,why:'После выполнения эффекта, но до коммита offset, сообщение может прийти повторно.'},
    {lv:'lead',q:'Для чего в CQRS обычно разделяют модели чтения и записи?',a:['Для независимой оптимизации запросов и команд','Чтобы запретить eventual consistency','Чтобы отказаться от событий','Чтобы убрать все базы данных'],ok:0,why:'CQRS разделяет модели команд и запросов, позволяя оптимизировать их независимо.'},
    {lv:'lead',q:'Какой подход корректнее для уникальности платежа при повторных запросах клиента?',a:['Проверка по времени на клиенте','Idempotency key с атомарной фиксацией','Увеличение количества Pod','Случайная задержка перед POST'],ok:1,why:'Идемпотентный ключ и атомарная запись результата предотвращают повторный платёж.'},
    {lv:'lead',q:'В каком случае CAP действительно заставляет выбирать между C и A?',a:['При сетевом разделении узлов','При любом SQL-запросе','При увеличении числа CPU','При обновлении Docker-образа'],ok:0,why:'Компромисс согласованности и доступности в CAP возникает при сетевом разделении (Partition).'},
    {lv:'lead',q:'Какая проблема возникает при одновременном dual-write в PostgreSQL и Kafka без Outbox?',a:['Расхождение из-за частичного сбоя','Дублирование Java-классов','Удаление Kafka-партиций','Невозможность создать индекс'],ok:0,why:'Если одна запись успешна, а другая нет, БД и события расходятся.'},
    {lv:'lead',q:'Как снизить риск каскадного отказа из-за медленного downstream?',a:['Убрать все таймауты','Таймауты, bulkhead и circuit breaker','Один общий пул потоков','Бесконечно повторять запросы'],ok:1,why:'Изоляция ресурсов, ограничения времени и размыкание цепи ограничивают распространение отказов.'},
    {lv:'lead',q:'Зачем в Event Sourcing часто создают snapshots?',a:['Чтобы ускорить восстановление агрегата','Чтобы заменить все доменные события','Чтобы шифровать API','Чтобы отменить event versioning'],ok:0,why:'Snapshot уменьшает число событий, которые нужно воспроизвести при восстановлении состояния.'},
    {lv:'lead',q:'Для чего используют GSLB в геораспределённой системе?',a:['Для распределения запросов между регионами','Для замены всех API Gateway','Для индексации таблиц','Для транзакций между Kafka-брокерами'],ok:0,why:'GSLB направляет пользователей к доступным или подходящим регионам по политике маршрутизации.'}
  ];
  const bonusQuestions = [
  {lv:'middle',kind:'theory',q:'Что верно об интерфейсе AutoCloseable?',a:['Он делает объект потокобезопасным','Его close() вызывается в try-with-resources','Он запускает фоновый GC','Он работает только с файлами'],ok:1,why:'try-with-resources автоматически вызывает close() у ресурсов AutoCloseable в обратном порядке создания.'},
  {lv:'middle',kind:'theory',q:'Что делает Optional.orElseGet()?',a:['Вычисляет запасное значение лениво','Всегда вызывает Supplier','Удаляет null из коллекции','Возвращает только Optional'],ok:0,why:'Supplier в orElseGet вызывается только если Optional пуст; аргумент orElse вычисляется заранее.'},
  {lv:'middle',kind:'theory',q:'Что верно о TreeMap по умолчанию?',a:['Сохраняет порядок вставки','Сортирует ключи по Comparable','Гарантирует O(1) поиск','Не допускает значений null'],ok:1,why:'TreeMap упорядочивает ключи по естественному порядку или переданному Comparator.'},
  {lv:'middle',kind:'theory',q:'Когда выполняется finally?',a:['Только при исключении','Обычно при любом завершении try','Только при return из catch','Только при закрытии JVM'],ok:1,why:'finally обычно выполняется при выходе из try/catch, в том числе через return; есть исключения вроде аварийного завершения JVM.'},
  {lv:'middle',kind:'theory',q:'Что означает HTTP 409 Conflict?',a:['Конфликт текущего состояния ресурса','Ошибка шлюза','Неверный формат JSON всегда','Отсутствие аутентификации'],ok:0,why:'409 указывает, что запрос конфликтует с текущим состоянием целевого ресурса.'},
  {lv:'middle',kind:'theory',q:'Какая аннотация в Spring MVC извлекает параметр пути?',a:['@PathVariable','@RequestBody','@RequestHeader','@ExceptionHandler'],ok:0,why:'@PathVariable связывает переменную из URI-шаблона с аргументом метода.'},
  {lv:'middleplus',kind:'theory',q:'Что означает правило PECS для Java generics?',a:['Producer extends, consumer super','Producer super, consumer extends','Параметр типа всегда инвариантен','Wildcards запрещены для Collection'],ok:0,why:'При чтении из производителя используйте ? extends T, при записи в потребителя — ? super T.'},
  {lv:'middleplus',kind:'theory',q:'Что может произойти из-за N+1 в Hibernate?',a:['Снижение числа SQL до одного','Много дополнительных запросов для связей','Всегда Deadlock','Валидация схемы не пройдёт'],ok:1,why:'При обходе связей ORM может выполнять отдельный запрос на каждый объект. Помогают fetch join, entity graph и батчинг.'},
  {lv:'middleplus',kind:'theory',q:'Зачем применяют EXPLAIN ANALYZE в PostgreSQL?',a:['Чтобы увидеть план и фактическое исполнение','Чтобы изменить уровень изоляции','Чтобы восстановить WAL','Чтобы зашифровать таблицу'],ok:0,why:'EXPLAIN ANALYZE выполняет запрос и показывает фактические затраты, количество строк и узлы плана.'},
  {lv:'middleplus',kind:'theory',q:'Для чего обычно применяют Testcontainers?',a:['Запуск реальных зависимостей в контейнерах при тестах','Замену всех unit-тестов','Шифрование тестовых классов','Рассылку уведомлений из CI'],ok:0,why:'Testcontainers позволяет поднять PostgreSQL, Kafka и другие зависимости для интеграционных тестов.'},
  {lv:'middleplus',kind:'code',q:'Что напечатает этот Java-код?',code:'String a = "java";\nString b = new String("java");\nSystem.out.println(a == b);',a:['true','false','Ошибка компиляции','NullPointerException'],ok:1,why:'== сравнивает ссылки, а new String создаёт новый объект. Для сравнения содержимого нужен equals().'},
  {lv:'middleplus',kind:'code',q:'Какой результат выдаст Stream?',code:'List.of(1, 2, 3, 4).stream()\n    .filter(x -> x % 2 == 0)\n    .map(x -> x * 10)\n    .toList();',a:['[10, 20, 30, 40]','[2, 4]','[20, 40]','[10, 30]'],ok:2,why:'Фильтр оставляет 2 и 4, затем map умножает их на 10.'},
  {lv:'middleplus',kind:'code',q:'Что напечатает код?',code:'var map = new HashMap<String, Integer>();\nmap.put("x", 1);\nmap.put("x", 2);\nSystem.out.println(map.size());',a:['0','1','2','Ошибка компиляции'],ok:1,why:'Повторный put по равному ключу заменяет значение, но не добавляет новую запись.'},
  {lv:'middleplus',kind:'code',q:'Что верно для этого фрагмента?',code:'List<String> names = List.of("A", "B");\nnames.add("C");',a:['Список станет из трёх элементов','Будет UnsupportedOperationException','Будет ConcurrentModificationException','Будет создан новый список'],ok:1,why:'Список, полученный через List.of, неизменяем; add бросает UnsupportedOperationException.'},
  {lv:'middleplus',kind:'code',q:'Как поведёт себя этот код с null?',code:'String s = null;\nSystem.out.println("ok".equals(s));',a:['Напечатает false','Выбросит NullPointerException','Напечатает true','Не скомпилируется'],ok:0,why:'Вызов equals у ненулевого литерала безопасен даже при null в аргументе.'},
  {lv:'middleplus',kind:'code',q:'Что случится при выполнении?',code:'var list = new ArrayList<>(List.of(1, 2));\nfor (Integer x : list) {\n  if (x == 1) list.remove(x);\n}',a:['Удаление всегда корректно','Может возникнуть ConcurrentModificationException','Возникнет ClassCastException','Удаление запрещено компилятором'],ok:1,why:'Модификация ArrayList через remove во время итерации нарушает fail-fast контракт итератора; конкретное проявление зависит от хода итерации.'},
  {lv:'middleplus',kind:'code',q:'Что напечатает код?',code:'var a = Optional.ofNullable(null);\nSystem.out.println(a.isEmpty());',a:['true','false','null','Ошибка компиляции'],ok:0,why:'ofNullable(null) создаёт пустой Optional, поэтому isEmpty() возвращает true.'},
  {lv:'middleplus',kind:'code',q:'Что верно при конкурентном исполнении?',code:'private volatile int counter = 0;\nvoid increment() { counter++; }',a:['Приращение атомарно','Возможна потеря инкрементов','volatile запрещён для int','Каждый поток видит свой counter'],ok:1,why:'counter++ включает чтение, увеличение и запись; volatile даёт видимость, но не атомарность. Поможет AtomicInteger.'},
  {lv:'middleplus',kind:'code',q:'Что произойдёт при вызове?',code:'int[] nums = {1, 2, 3};\nSystem.out.println(nums.length);',a:['3','2','Ошибка компиляции','NullPointerException'],ok:0,why:'У массива есть поле length, в отличие от String.length() и Collection.size().'},
  {lv:'middleplus',kind:'code',q:'Что верно о транзакции в этом коде (Spring proxy mode)?',code:'@Service class PayService {\n  void start() { save(); }\n  @Transactional void save() { /* ... */ }\n}',a:['Вызов save() обходит транзакционный proxy','save() всегда открывает новую транзакцию','Код не скомпилируется','start() станет @Async'],ok:0,why:'Внутренний вызов this.save() не проходит через AOP-прокси, поэтому аннотация сама по себе не включает транзакцию.'},
  {lv:'middleplus',kind:'code',q:'Что напечатает этот код?',code:'var data = List.of("a", "bb", "ccc");\nSystem.out.println(data.stream()\n    .filter(s -> s.length() > 1).count());',a:['1','2','3','0'],ok:1,why:'Под условие длины больше единицы подходят bb и ccc.'},
  {lv:'middleplus',kind:'code',q:'Что выведет программа?',code:'int x = 5;\nint y = x++;\nSystem.out.println(y + ":" + x);',a:['6:6','5:6','5:5','6:5'],ok:1,why:'Постфиксный ++ отдаёт старое значение выражения, а затем увеличивает переменную.'},
  {lv:'senior',kind:'code',q:'Какой риск есть в этом коде?',code:'if (!cache.containsKey(key)) {\n  cache.put(key, loadFromDb(key));\n}',a:['Гарантированный deadlock','Несколько потоков могут одновременно загрузить одно значение','Невозможно использовать ConcurrentHashMap','Сломается JVM JIT'],ok:1,why:'Проверка и запись — отдельные действия. Для атомарной вставки часто применяют computeIfAbsent с учётом ограничений функции.'},
  {lv:'senior',kind:'code',q:'Что потенциально не так с этим методом?',code:'@Transactional\npublic void update() {\n  repository.save(entity);\n  try { externalApi.call(); } catch (Exception e) {}\n}',a:['Ошибку внешнего вызова скрывают и транзакция может закоммититься','JPA запрещает вызовы API','@Transactional всегда откатывает всё','save() безусловно выполняет COMMIT'],ok:0,why:'Исключение проглатывается, поэтому стандартный transactional interceptor не видит сбоя. Внешний вызов не откатывается вместе с SQL.'},
  {lv:'senior',kind:'code',q:'Почему здесь возможна ошибка при параллельных запросах?',code:'private static final SimpleDateFormat F =\n  new SimpleDateFormat("yyyy-MM-dd");\nString s = F.format(date);',a:['SimpleDateFormat не потокобезопасен','static запрещён для форматтера','Date нельзя форматировать','Здесь нет общего состояния'],ok:0,why:'SimpleDateFormat изменяет внутреннее состояние; совместное использование в потоках небезопасно. DateTimeFormatter неизменяем.'},
  {lv:'senior',kind:'code',q:'Какой эффект возможен без явной блокировки?',code:'var v = repository.findById(id).orElseThrow();\nv.setBalance(v.getBalance() - amount);\nrepository.save(v);',a:['Всегда serializable','Lost update при конкурентном списании','Автоматический distributed lock','Гарантированное exactly-once'],ok:1,why:'Две транзакции могут прочитать одинаковый остаток и перезаписать изменения. Нужны версии, блокировки или атомарный UPDATE.'},
  {lv:'senior',kind:'code',q:'Что рискует произойти при этом retry?',code:'for (int i=0;i<5;i++) {\n  try { chargeCard(); break; }\n  catch (TimeoutException e) {}\n}',a:['Запрос может повторно списать деньги','Timeout гарантирует отсутствие операции','Пять попыток всегда атомарны','Kafka исправит операцию автоматически'],ok:0,why:'Таймаут не доказывает, что операция не выполнена. Нужен идемпотентный ключ платежа.'},
  {lv:'senior',kind:'code',q:'В чём проблема этого SQL-подхода?',code:'SELECT * FROM orders\nWHERE status = ?\nORDER BY created_at DESC\nOFFSET 100000 LIMIT 20;',a:['Большой OFFSET может быть дорогим','ORDER BY запрещён с LIMIT','WHERE делает сортировку невозможной','Этот SQL всегда использует index-only scan'],ok:0,why:'При глубокой пагинации СУБД может просмотреть и пропустить много строк. Для ленты часто подходит keyset pagination.'},
  {lv:'senior',kind:'code',q:'Какой баг возможен в этой операции с Redis?',code:'var n = redis.get("counter");\nredis.set("counter", n + 1);',a:['Lost update при конкуренции','Redis не поддерживает числа','Все операции автоматически объединены','GET всегда сбрасывает TTL'],ok:0,why:'Пара GET и SET не атомарна. Для инкремента используйте INCR или Lua-скрипт.'},
  {lv:'senior',kind:'incident',q:'После масштабирования сервиса с 3 до 12 Pod PostgreSQL сообщает too many connections. Первый шаг?',a:['Добавить ещё Pod','Проверить суммарные размеры пулов и лимит БД','Отключить WAL','Перенести всё в MongoDB'],ok:1,why:'Число соединений примерно умножается на число реплик. Оцените pool size, max_connections и возможность PgBouncer.'},
  {lv:'senior',kind:'incident',q:'После деплоя вырос p99, а средняя задержка почти не изменилась. Что исследовать?',a:['Только среднее CPU','Трейсы и хвостовые задержки по операциям','Цвет логотипа','Количество строк Java-кода'],ok:1,why:'p99 указывает на медленный хвост запросов. Нужны distributed tracing, разбивка по endpoint и зависимостям.'},
  {lv:'senior',kind:'incident',q:'При повторной доставке Kafka-события заказ списывается дважды. Как защититься?',a:['Отключить offset commit','Ввести идемпотентность по eventId','Увеличить partitions','Убрать consumer group'],ok:1,why:'Повторная доставка возможна. Атомарно фиксируйте факт обработки идентификатора события вместе с бизнес-изменением.'},
  {lv:'senior',kind:'incident',q:'У API резко выросла нагрузка, а база перегружена одинаковыми SELECT. Что проверить?',a:['Cache Aside, TTL и cache hit rate','Число git-веток','Версию IDE','Только размер Docker-образа'],ok:0,why:'Кэширование частых чтений снижает нагрузку на БД, но требует стратегии инвалидирования и контроля устаревания.'},
  {lv:'senior',kind:'incident',q:'Во время релиза Kubernetes начал отправлять запросы в ещё не готовые Pod. Как исправить?',a:['Настроить readinessProbe','Увеличить число labels','Выключить TLS','Удалить Service'],ok:0,why:'readinessProbe управляет готовностью Pod к приёму трафика и исключает неготовые endpoint из маршрутизации.'},
  {lv:'senior',kind:'incident',q:'После включения синхронных retries сервисы начали массово перегружать зависимость. Что сделать?',a:['Бесконечно повторять вызовы','Ограничить retries, добавить backoff и jitter','Выключить все timeout','Увеличить HTTP-заголовки'],ok:1,why:'Без ограничения повторов возникает retry storm. Нужны лимиты попыток, экспоненциальная задержка, jitter и бюджеты.'},
  {lv:'senior',kind:'incident',q:'Consumer Kafka неожиданно повторно обрабатывает события после падения. Почему?',a:['Коммит offset мог не состояться','Kafka никогда не хранит offsets','Топик всегда очищается при restart','Producer не умеет батчинг'],ok:0,why:'Бизнес-обработка могла завершиться, но offset ещё не был сохранён. Это нормальный риск at-least-once.'},
  {lv:'senior',kind:'incident',q:'У очереди растёт lag, CPU consumer невысокий, downstream отвечает медленно. Что сначала измерить?',a:['Скорость downstream и время обработки сообщения','Количество git tags','Размер README','Лишь CPU Kafka broker'],ok:0,why:'Lag может расти из-за медленной зависимости; полезны latency/throughput обработчиков, timeouts и backpressure.'},
  {lv:'senior',kind:'incident',q:'После добавления индекса INSERT/UPDATE ощутимо замедлились. Почему?',a:['Индексы требуют обновления при записи','Индекс отключает WAL','INSERT теперь всегда работает без транзакций','B-tree исключает VACUUM'],ok:0,why:'Каждый дополнительный индекс требует обслуживания при изменении строк, увеличивая стоимость записей.'},
  {lv:'lead',kind:'incident',q:'Из-за сетевой аварии один регион изолирован, но продолжает принимать платежи. Какой риск?',a:['Расхождение состояния и двойная обработка','Гарантированная линейризуемость','Автоматическая глобальная ACID','Отсутствие любых конфликтов'],ok:0,why:'При partition автономные записи могут расходиться. Для платежей нужны чёткая модель согласованности и правила при split-brain.'},
  {lv:'lead',kind:'incident',q:'Часть событий outbox публикуется повторно после рестарта relay. Это ошибка дизайна?',a:['Да, outbox запрещает повторы','Нет, downstream должен быть идемпотентным','Да, транзакция БД гарантирует единственную доставку','Повторы устраняют одним sleep'],ok:1,why:'Outbox обеспечивает атомарную запись события и данных в БД, но публикация обычно at-least-once; потребитель должен корректно обрабатывать повторы.'},
  {lv:'senior',kind:'design',q:'Для ленты новостей нужен быстрый показ первой страницы при большом объёме данных. Что выбрать?',a:['Keyset pagination по устойчивому курсору','OFFSET миллионы строк','SELECT без LIMIT','Постоянный FULL TABLE SCAN'],ok:0,why:'Keyset pagination избегает пропуска огромного OFFSET и эффективна при подходящем индексе и стабильном порядке.'},
  {lv:'senior',kind:'design',q:'Сервис заказов пишет в PostgreSQL и затем публикует событие в Kafka. Как избежать потери события?',a:['Transactional Outbox','Ещё один HTTP timeout','Больше partitions','Писать сначала в Redis'],ok:0,why:'Заказ и запись outbox фиксируются одной локальной транзакцией; отдельный relay публикует событие с возможными повторами.'},
  {lv:'senior',kind:'design',q:'Нужно увеличить пропускную способность чтения каталога при редких обновлениях. Что логично?',a:['Read replicas и/или кеш чтений','Писать все чтения в primary','Каждый запрос делать SERIALIZABLE','Отключить индексы'],ok:0,why:'Реплики и кэш разгружают primary; необходимо учитывать задержку репликации и устаревание кэша.'},
  {lv:'senior',kind:'design',q:'Где лучше хранить видеофайлы VOD-платформы?',a:['В объектном хранилище, доставлять через CDN','В PostgreSQL B-tree индексах','В оперативной памяти API Gateway','В consumer offsets Kafka'],ok:0,why:'S3-подобное хранилище удобно для объектов; CDN снижает задержку доставки медиа конечным пользователям.'},
  {lv:'senior',kind:'design',q:'Нужен мгновенный push событий из сервера в браузер, клиент не отправляет события обратно по каналу. Что выбрать?',a:['SSE','HTTP polling раз в час','SMTP','Только UDP multicast'],ok:0,why:'SSE поддерживает однонаправленный поток server→client поверх HTTP; для полноценного двустороннего обмена подойдёт WebSocket.'},
  {lv:'senior',kind:'design',q:'Для глобально доступного статического контента что эффективнее?',a:['CDN с edge-кешами','Один origin без кеша','Синхронная БД на каждом запросе','Long polling'],ok:0,why:'CDN кеширует объекты ближе к пользователям и снижает RTT и нагрузку origin.'},
  {lv:'lead',kind:'design',q:'Как спроектировать выдачу уникального купона без двойного использования?',a:['Атомарное ограничение/обновление в БД','Проверять флаг в браузере','Надеяться на однопоточность Pod','Добавить 1 секунду sleep'],ok:0,why:'Инвариант единственного использования защищают атомарной операцией или уникальным ограничением в authoritative storage.'},
  {lv:'lead',kind:'design',q:'Какую стратегию применить для миллионов пользователей и распределения нагрузки между регионами?',a:['GSLB + региональная маршрутизация и failover','Один сервер с hosts-файлом','Только sticky sessions','Глобальный mutex в JVM'],ok:0,why:'GSLB направляет трафик к подходящему региону; для данных отдельно проектируют репликацию, согласованность и failover.'},
  {lv:'lead',kind:'design',q:'Как уменьшить стоимость восстановления состояния Event Sourcing агрегата с длинной историей?',a:['Периодические snapshots + replay последующих событий','Удалить все исходные события','Заменить события логами stdout','Восстанавливать только последнюю команду'],ok:0,why:'Snapshot хранит контрольное состояние, а события после него воспроизводятся для получения актуального агрегата.'},
  {lv:'lead',kind:'design',q:'Как обеспечить масштабирование обработки событий по ключу заказа с сохранением порядка?',a:['Одинаковый orderId использовать как Kafka key','Случайно выбирать partition на каждое событие','Один consumer на каждую запись','Удалить consumer group'],ok:0,why:'Стабильный ключ направляет события одного заказа в одну партицию, где Kafka сохраняет их порядок записи.'},
  {lv:'lead',kind:'design',q:'При сетевом разделении сервис должен запрещать противоречивые переводы денег. Что важнее?',a:['Ограничить доступность записей ради согласованности','Подтверждать любые записи в обеих частях','Полагаться только на кэш','Сделать все запросы GET'],ok:0,why:'Для финансового инварианта при partition лучше отказывать в опасных записях, чем подтверждать несовместимые операции.'},
  {lv:'lead',kind:'design',q:'Сервис рекомендаций требует обновлять материализованное представление по событиям с допустимой задержкой. Что выбрать?',a:['Event-driven проекцию с eventual consistency','Распределённую XA-транзакцию на каждое чтение','Полный скан всех источников каждый запрос','Синхронную блокировку всех сервисов'],ok:0,why:'Асинхронная проекция позволяет масштабировать чтения независимо; UI должен учитывать задержку согласования.'},
  {lv:'lead',kind:'design',q:'Как снизить риск cascading failure, когда внешний API стал отвечать по 30 секунд?',a:['Timeout + bulkhead + circuit breaker','Увеличить timeout до бесконечности','Глобальная блокировка всех запросов','Бесконечные retries без jitter'],ok:0,why:'Таймауты, изоляция ресурсов и circuit breaker ограничивают воздействие медленного downstream на остальные функции.'},
  {lv:'lead',kind:'design',q:'Как архитектурно поддержать разные модели для интенсивных команд и сложных пользовательских запросов?',a:['CQRS с отдельными write/read-моделями','Отказаться от индексов','Один SQL-запрос для любой операции','Хранить все данные только в памяти'],ok:0,why:'CQRS разделяет обработку команд и чтений, позволяя оптимизировать каждую часть независимо. Это усложняет синхронизацию.'},
  {lv:'lead',kind:'design',q:'В маркетплейсе резерв склада и оплата принадлежат разным микросервисам. Как координировать процесс без общей ACID БД?',a:['Saga с компенсациями и идемпотентностью','Один локальный @Transactional на API Gateway','SELECT FOR UPDATE по сетевому пути','Два POST без отслеживания статуса'],ok:0,why:'Saga координирует локальные транзакции; при сбоях выполняет компенсации. Нужны устойчивое состояние процесса и повторы.'},
  {lv:'lead',kind:'design',q:'Что требуется для корректного перехода пользователей в резервный регион при падении primary?',a:['Маршрутизация failover, готовность региона и продуманная репликация данных','Только DNS с TTL 0','Только Health Check UI','Увеличить число Java-потоков'],ok:0,why:'GSLB/DNS failover недостаточен без готового регионального стека и заранее выбранных RPO/RTO, репликации и восстановления.'},
  {lv:'lead',kind:'design',q:'У messenger миллионы WebSocket-соединений. Где хранить связь userId→активный gateway?',a:['В распределённом presence/registry с TTL','В одном локальном HashMap на любом Pod','В HTTP cookie всех пользователей','В таблице статических CDN-файлов'],ok:0,why:'Распределённый реестр позволяет находить gateway активного соединения. TTL/heartbeat устраняют устаревшие записи.'},
  {lv:'lead',kind:'design',q:'Клиент повторяет POST /payments после сетевого timeout. Как избежать повторного списания?',a:['Idempotency-Key и атомарная фиксация результата','Случайный sleep','Добавить больше worker','Отключить TLS'],ok:0,why:'Повторный запрос с тем же ключом должен возвращать тот же зафиксированный результат. Проверку и изменение проводят атомарно.'},
  {lv:'lead',kind:'design',q:'Какой подход помогает избежать hot shard при партиционировании очень активных пользователей?',a:['Продумать распределение ключей и выделение горячих объектов','Всегда выбирать возрастающий timestamp как shard key','Хранить всё на одной ноде','Отключить шардинг и мониторинг'],ok:0,why:'Равномерность распределения и стратегия для горячих ключей важнее количества шардов; иногда применяют bucket/salting.'}
];
  // Полный банк из 920 вопросов: автономные данные, упакованные в gzip/base64 для Tilda.
let quizBank920 = [];
  let bankLoadError = null;
  let questionPool = originalQuestions.map(q=>({...q,kind:'theory',section:'Дополнительные задания'})).concat(bonusQuestions.map(q=>({...q,section:q.kind==='design'?'System Design':'Практика'})));
  const bankUrl = new URL('questions.json', document.currentScript?.src || window.location.href);
  async function decodeQuizBank() {
    // Load questions next to the JS file, not relative to the Tilda domain.
    try {
      const response = await fetch(bankUrl, {cache:'no-cache'});
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const loaded = await response.json();
      if (!Array.isArray(loaded) || loaded.length !== 920 ||
          loaded.some(q => !q.q || !q.why || !Array.isArray(q.a) || q.a.length !== 4 ||
                           !Number.isInteger(q.ok) || q.ok < 0 || q.ok > 3)) {
        throw new Error('Неверный формат questions.json');
      }
      quizBank920 = loaded;
      questionPool = loaded.concat(questionPool);
      root.dataset.questionBankSize = String(loaded.length);
    } catch (err) {
      bankLoadError = String(err);
      console.error('Java Career Race: не удалось загрузить банк', err);
      throw err;
    }
  }

  const seenQuestions = new Set();
  const initialRivals = [
    {x:54,y:580,speed:90,name:'A1'},
    {x:1070,y:576,speed:99,name:'A2'},
    {x:55,y:182,speed:97,name:'A3'},
    {x:1045,y:180,speed:92,name:'A4'}
  ];

  let difficulty='easy', mode='intro', paused=false, month=1, monthElapsed=0;
  let cash=DIFFICULTIES.easy.start, skill=1, job=null, hiredAtMonth=0;
  let simSeconds=0, serial=1, nextSpawn=3, playerTargetId=null, pointTarget=null;
  let interview=null, questionRemaining=0, startupUnlocked=false, rivals=[];
  let feed=[], toastLeft=0, framePrevious=0, mapScale=1, followTime=0;
  let gameInView=true, lastContact=null, mousePointStart=null;
  const keys = new Set(), touchKeys = new Set();
  const player = {x:560,y:577,speed:252};
  const officeNodes = new Map();
  const playerNode=$('jg-player'), routeLine=$('jg-route-line');
  const mapWindow=$('jg-map-window'),mapWorld=$('jg-map-world'),mapSizer=$('jg-map-sizer');
  const rivalsLayer=$('jg-rivals');

  function currentSetting(){return DIFFICULTIES[difficulty];}
  function currentCost(){return currentSetting().cost;}
  function currentGoal(){return currentSetting().goal;}
  function allJobs(){return companies.flatMap(c=>c.jobs);}
  function companyById(id){return companies.find(c=>c.id===id);}
  function jobById(id){return allJobs().find(v=>v.id===id);}
  function pickRole(){
    let p=Math.random();
    for(const role of ROLES){p-=role.weight;if(p<=0)return role;}
    return ROLES[ROLES.length-1];
  }
  function addLog(msg,severity='neutral'){
    feed.unshift({msg,severity,month});feed=feed.slice(0,9);
    $('jg-feed').innerHTML=feed.map(x=>`<div class="jg-event"><span class="jg-event-dot ${x.severity==='good'?'good':x.severity==='bad'?'bad':''}"></span><div class="jg-event-text"><strong>Мес. ${x.month}.</strong> ${safe(x.msg)}</div></div>`).join('');
  }
  function toast(msg){
    const t=$('jg-toast');t.textContent=msg;t.classList.add('show');toastLeft=3.3;
  }
  function createOffices(){
    const layer=$('jg-offices');layer.innerHTML='';officeNodes.clear();
    for(const c of companies){
      const b=document.createElement('button');b.type='button';b.className='jg-office';
      b.dataset.company=c.id;b.style.left=c.x+'px';b.style.top=c.y+'px';
      b.style.setProperty('--jg-office-accent',c.accent);
      b.innerHTML=`<span class="jg-office-name">${safe(c.name)}</span><span class="jg-office-row"><span class="jg-office-role">Java Development</span><span class="jg-office-tag">НЕТ МЕСТ</span></span>`;
      layer.appendChild(b);officeNodes.set(c.id,b);
    }
  }
  function renderOffices(){
    for(const c of companies){
      const n=officeNodes.get(c.id);
      n.classList.toggle('jg-open',c.jobs.length>0);
      n.classList.toggle('jg-employed',!!(job&&job.companyId===c.id));
      if(c.jobs.length){
        const ordered=[...c.jobs].sort((a,b)=>b.salary-a.salary);
        n.querySelector('.jg-office-role').textContent=c.jobs.length===1?ordered[0].roleName:`${c.jobs.length} вакансии Java`;
        n.querySelector('.jg-office-tag').textContent=c.jobs.length===1?Math.round(ordered[0].salary/1000)+'k ₽':c.jobs.length+' ОФФЕРА';
        n.setAttribute('aria-label',`${c.name}: ${c.jobs.length} вакансий, нажмите чтобы бежать`);
      }else{
        n.querySelector('.jg-office-role').textContent=job&&job.companyId===c.id?'Вы работаете здесь':'Java Development';
        n.querySelector('.jg-office-tag').textContent='НЕТ МЕСТ';
        n.setAttribute('aria-label',c.name+': нет вакансий');
      }
    }
  }
  function renderOffers(){
    const offers=allJobs().sort((a,b)=>b.salary-a.salary);
    $('jg-offer-count').textContent=offers.length;
    $('jg-offer-list').innerHTML=offers.length?offers.map(v=>{
      const c=companyById(v.companyId);
      return `<div class="jg-offer"><div class="jg-offer-meta"><div class="jg-offer-name">${safe(c.name)} · ${safe(v.roleName)}</div><div class="jg-offer-salary">${fmt(v.salary)}/мес. · ${v.questionCount} вопр.</div></div><button type="button" data-run="${v.id}" class="${playerTargetId===v.id?'jg-offer-target':''}">${playerTargetId===v.id?'Бегу…':'Бежать'}</button></div>`;
    }).join(''):'<div class="jg-offer-empty">Пока свободных вакансий нет. Скоро появятся новые.</div>';
  }
  function renderCareer(){
    const badge=$('jg-job-indicator'), info=$('jg-current-job'),bar=$('jg-job-progress-bar'),hint=$('jg-job-hint');
    if(!job){
      badge.textContent='В ПОИСКЕ';badge.className='jg-badge jg-badge-muted';
      info.textContent='Ищите светящиеся вакансии. Вы можете свободно перемещаться по карте или нажать «Бежать».';
      bar.style.width='0%';hint.textContent='Каждые 6 игровых месяцев на одной позиции ИИ заменяет сотрудника.';
      hint.classList.remove('jg-job-urgent');
    }else{
      const age=month-hiredAtMonth;
      badge.textContent='В КОМАНДЕ';badge.className='jg-badge jg-badge-active';
      info.innerHTML=`<div class="jg-job-name">${safe(companyById(job.companyId).name)}</div><div class="jg-job-small">${safe(job.roleName)} · <strong>${fmt(job.paidSalary)}/мес.</strong></div>`;
      bar.style.width=clamp(age/6*100,0,100)+'%';
      hint.textContent=age>=4?`До автоматизации ИИ осталось ${6-age} мес. Пора сменить работу.`:`На позиции ${age} из 6 месяцев.`;
      hint.classList.toggle('jg-job-urgent',age>=4);
    }
  }
  function renderStats(){
    $('jg-money').textContent=fmt(cash);
    $('jg-money').style.color=cash<currentCost()?'#ff9da0':'';
    $('jg-wealth-progress').style.width=clamp(cash/currentGoal()*100,0,100)+'%';
    $('jg-income').textContent=fmt(job?job.paidSalary:0);
    $('jg-role-label').textContent=job?companyById(job.companyId).name+' · '+job.roleName:'Пока без работы';
    $('jg-expenses').textContent='−'+fmt(currentCost());
    $('jg-goal-label').textContent='Цель: '+fmt(currentGoal())+' · '+currentSetting().label;
    $('jg-month').textContent=String(month).padStart(2,'0');
    $('jg-skill').textContent='Переходов: '+(skill-1);
    renderCareer();
  }
  function renderAll(){renderOffices();renderOffers();renderStats();}
  function createVacancy(c,role){
    const salary=Math.round(rand(role.min/5000,role.max/5000))*5000;
    const v={id:'v'+serial++,companyId:c.id,roleName:role.roleName,
      level:role.id,roleLabel:role.label,questionCount:role.questions,salary,
      expires:rand(25,41)};
    c.jobs.push(v);return v;
  }
  function spawnVacancy(){
    if(allJobs().length>=10)return;
    let possible=companies.filter(c=>c.jobs.length<2&&(!job||job.companyId!==c.id));
    if(!possible.length)return;
    const free=possible.filter(c=>!c.jobs.length);
    const c=sample(free.length&&Math.random()<.85?free:possible);
    const role=pickRole();const v=createVacancy(c,role);
    renderOffices();renderOffers();
    if(mode!=='intro'){
      addLog(`Новая вакансия: ${c.name}, ${v.roleName}, ${fmt(v.salary)}.`, 'good');
      if(Math.random()<.35)toast('Открыт оффер: '+c.name+' · '+v.roleName);
    }
  }
  function removeVacancy(id,reason){
    const v=jobById(id);if(!v)return;
    const c=companyById(v.companyId);c.jobs=c.jobs.filter(item=>item.id!==id);
    if(playerTargetId===id){playerTargetId=null;routeLine.style.display='none';if(reason==='rival')toast('Вы опоздали: '+c.name+' нанял другого кандидата.');}
    for(const r of rivals)if(r.targetId===id){r.targetId=null;r.reactAt=simSeconds+rand(.6,2);}
    renderOffices();renderOffers();
  }
  function moveToward(o,x,y,dt,speed){
    const dx=x-o.x,dy=y-o.y,dist=Math.hypot(dx,dy);
    if(dist<.05)return true;
    const step=Math.min(dist,dt*speed);
    o.x+=dx/dist*step;o.y+=dy/dist*step;
    return dist<=step+1;
  }
  function followPlayer(immediate=false){
    if(mapSizer.clientWidth<=mapWindow.clientWidth+1)return;
    const want=clamp(player.x*mapScale-mapWindow.clientWidth*.5,0,mapSizer.clientWidth-mapWindow.clientWidth);
    mapWindow.scrollLeft=immediate?want:mapWindow.scrollLeft+(want-mapWindow.scrollLeft)*.15;
  }
  function runTo(id){
    if(mode!=='running'||paused)return;
    const v=jobById(id);if(!v){toast('Эту вакансию уже закрыли.');return;}
    pointTarget=null;playerTargetId=id;renderOffers();
    toast('Бежим: '+companyById(v.companyId).name+' · '+v.roleName);
    const c=companyById(v.companyId);
    if(Math.hypot(player.x-c.x,player.y-c.y-53)<8){
      playerTargetId=null;lastContact=c.id;startInterview(id);
    }
  }
  function nearbyVacancy(){
    const nearby=companies.filter(c=>c.jobs.length&&Math.hypot(player.x-c.x,player.y-c.y-53)<75);
    if(!nearby.length)return null;
    const office=nearby.sort((a,b)=>Math.hypot(player.x-a.x,player.y-a.y-53)-Math.hypot(player.x-b.x,player.y-b.y-53))[0];
    const v=[...office.jobs].sort((a,b)=>a.salary-b.salary)[0];
    return {office,v};
  }
  function updateNearby(){
    const b=$('jg-interact');
    if(!b)return;
    const near=nearbyVacancy();
    b.classList.toggle('jg-hidden',!near||mode!=='running');
    if(near)b.textContent='⏎ Собеседование: '+near.office.name+' · '+near.v.roleLabel;
  }
  function interactNearby(){
    if(mode!=='running'||paused)return;
    const near=nearbyVacancy();
    if(near){playerTargetId=null;pointTarget=null;routeLine.style.display='none';startInterview(near.v.id);}else toast('Подойдите к офису со свободной вакансией.');
  }
  function moveToPoint(x,y){
    if(mode!=='running'||paused)return;
    pointTarget={x:clamp(x,20,W-20),y:clamp(y,22,H-20)};
    playerTargetId=null;routeLine.style.display='none';renderOffers();
  }
  function updatePlayer(dt){
    const beforeX=player.x,beforeY=player.y;
    const held=new Set([...keys,...touchKeys]);
    let dx=(held.has('right')?1:0)-(held.has('left')?1:0);
    let dy=(held.has('down')?1:0)-(held.has('up')?1:0);
    if(dx||dy){
      const len=Math.hypot(dx,dy);dx/=len;dy/=len;
      playerTargetId=null;pointTarget=null;routeLine.style.display='none';
      player.x=clamp(player.x+dx*player.speed*dt,20,W-20);
      player.y=clamp(player.y+dy*player.speed*dt,20,H-20);
    }else if(playerTargetId){
      const v=jobById(playerTargetId);
      if(!v){playerTargetId=null;routeLine.style.display='none';renderOffers();}
      else{
        const c=companyById(v.companyId);
        routeLine.style.display='';
        routeLine.setAttribute('x1',player.x);routeLine.setAttribute('y1',player.y);
        routeLine.setAttribute('x2',c.x);routeLine.setAttribute('y2',c.y+53);
        if(moveToward(player,c.x,c.y+53,dt,player.speed)){
          player.x=c.x;player.y=c.y+53;
          const id=playerTargetId;playerTargetId=null;pointTarget=null;
          routeLine.style.display='none';lastContact=c.id;
          playerNode.style.left=player.x+'px';playerNode.style.top=player.y+'px';
          startInterview(id);
          renderOffers();return;
        }
      }
    }else if(pointTarget){
      if(moveToward(player,pointTarget.x,pointTarget.y,dt,player.speed))pointTarget=null;
    }
    playerNode.style.left=player.x+'px';playerNode.style.top=player.y+'px';
    const didMove=Math.hypot(player.x-beforeX,player.y-beforeY)>.01;
    if(didMove && simSeconds-followTime>.10){followPlayer();followTime=simSeconds;}
    updateNearby();
  }
  function initializeRivals(){
    rivals=initialRivals.map((r,i)=>({...r,origX:r.x,origY:r.y,targetId:null,reactAt:rand(1.5,4)+i*.2,freeAt:0,node:null}));
    rivalsLayer.innerHTML='';
    for(const r of rivals){
      const n=document.createElement('div');n.className='jg-person jg-person-rival';
      n.title='Соискатель';n.innerHTML=`<div class="jg-person-icon">${safe(r.name)}</div><div class="jg-person-name">КАНДИДАТ</div>`;
      n.style.left=r.x+'px';n.style.top=r.y+'px';rivalsLayer.appendChild(n);r.node=n;
    }
  }
  function updateRivals(dt){
    for(const r of rivals){
      if(simSeconds<r.freeAt)continue;
      let v=r.targetId&&jobById(r.targetId);
      if(!v&&simSeconds>r.reactAt&&allJobs().length){
        const near=allJobs().map(v=>({v,d:Math.hypot(r.x-companyById(v.companyId).x,r.y-companyById(v.companyId).y)})).sort((a,b)=>a.d-b.d);
        v=(Math.random()<.65?near[0]:near[Math.floor(Math.random()*Math.min(3,near.length))]).v;
        r.targetId=v.id;
      }
      if(v){
        const c=companyById(v.companyId);
        if(moveToward(r,c.x,c.y+53,dt,r.speed)){
          r.x=c.x;r.y=c.y+53;removeVacancy(v.id,'rival');
          r.targetId=null;r.freeAt=simSeconds+rand(4.5,8);
          r.reactAt=r.freeAt+rand(.7,2);
          addLog('Конкурент занял место в '+c.name+'.','bad');
        }
      }else if(simSeconds>r.freeAt){
        moveToward(r,r.origX+Math.sin(simSeconds*.26+r.origX)*18,r.origY+Math.cos(simSeconds*.2+r.origY)*14,dt,r.speed*.25);
      }
      r.node.style.left=r.x+'px';r.node.style.top=r.y+'px';
    }
  }
  function showDialog(html,kind){
    mode=kind;keys.clear();touchKeys.clear();
    $('jg-dialog').innerHTML=html;
    $('jg-overlay').classList.toggle('jg-hidden',kind==='intro'&&!gameInView);
    $('jg-pause').disabled=true;
  }
  function closeDialog(){
    $('jg-overlay').classList.add('jg-hidden');$('jg-dialog').innerHTML='';
    mode='running';$('jg-pause').disabled=false;framePrevious=performance.now();
  }
  function chooseDifficulty(value){
    if(!(value in DIFFICULTIES)||mode!=='intro')return;
    difficulty=value;
    root.querySelectorAll('[data-difficulty]').forEach(b=>{
      b.classList.toggle('jg-difficulty-selected',b.dataset.difficulty===value);
      b.setAttribute('aria-pressed',b.dataset.difficulty===value?'true':'false');
    });
    const desc=$('jg-start-budget');
    if(desc)desc.innerHTML=`Стартовый капитал: <b>${fmt(currentSetting().start)}</b>. Цель: <b>${fmt(currentGoal())}</b>. Ежемесячные расходы: <b>${fmt(currentCost())}</b>.`;
  }
  function introDialog(){
    showDialog(`<div class="jg-dialog-kicker">JAVA CAREER RACE · НОВАЯ ИГРА</div>
      <h3>Кто развивается — <em>побеждает.</em></h3>
      <p>Обгоняйте других соискателей, проходите Java-собеседования и копите на свой стартап. Выберите сложность:</p>
      <div class="jg-difficulty-grid">
        ${Object.entries(DIFFICULTIES).map(([key,v])=>`<button type="button" data-difficulty="${key}" class="jg-difficulty ${difficulty===key?'jg-difficulty-selected':''}" aria-pressed="${difficulty===key}"><b>${v.label}</b><span>Цель ${fmt(v.goal)}</span><small>Расходы ${fmt(v.cost)}/мес.</small></button>`).join('')}
      </div>
      <p id="jg-start-budget" class="jg-start-budget"></p>
      <div class="jg-dialog-actions"><button type="button" class="jg-btn jg-btn-primary" data-action="start">НАЧАТЬ ИГРУ →</button></div>
      <p class="jg-start-budget">Банк: ${quizBank920.length} из 920 вопросов из CSV + дополнительные игровые задания. ${bankLoadError?"Внимание: банк недоступен в этом браузере.":"Категория вопроса показывается на собеседовании."}</p>
      <div class="jg-rules">
        <div class="jg-rule"><b>Свободное движение</b><span>WASD, стрелки, клик или кнопки. Возле офиса нажмите E для интервью. Клик по вакансии — автобег.</span></div>
        <div class="jg-rule"><b>920 вопросов в банке · от 1 до 4 за интервью</b><span>Middle — 1; Middle+ — 2; Senior — 3; Tech Lead — 4.</span></div>
        <div class="jg-rule"><b>5 секунд = месяц</b><span>Зарплата минус расходы на жизнь. Во время собеседования часы стоят.</span></div>
        <div class="jg-rule"><b>ИИ ждёт 6 месяцев</b><span>Если не перешли на новую позицию — потеряете работу и зарплату.</span></div>
      </div>`, 'intro');
    chooseDifficulty(difficulty);
  }
  function helpDialog(){
    if(mode!=='running')return;
    showDialog(`<div class="jg-dialog-kicker">ПРАВИЛА · ${safe(currentSetting().label)}</div><h3>Как играть</h3>
      <p>Герой свободно перемещается по карте по WASD/стрелкам, экранным кнопкам или клику на местности. Нажмите на светящийся офис или «Бежать» возле оффера, чтобы герой сам прибежал. Подойдя к офису вручную, нажмите E или кнопку «Собеседование» под картой.</p>
      <p>Middle — 1 вопрос (160–250 тыс. ₽). Middle+ — 2 вопроса, включая код (250–350 тыс.). Senior — 3, включая инцидент/архитектуру (350–500 тыс.). Tech Lead — 4, включая System Design (500 тыс.–1 млн).</p>
      <p>Неправильный ответ останавливает попытку: появляется верный вариант и разбор. Весь игровой мир стоит, пока открыто интервью или разбор.</p>
      <p>Каждый месяц занимает 5 секунд. Траты: <b>${fmt(currentCost())}</b>, цель: <b>${fmt(currentGoal())}</b>. Через 6 месяцев на одной работе сотрудника вытесняет ИИ. После накопления цели можно открыть стартап.</p>
      <div class="jg-dialog-actions"><button type="button" class="jg-btn jg-btn-primary" data-action="continue">Вернуться в город</button></div>`,'help');
  }
  function shuffle(arr){
    for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}
    return arr;
  }
  function drawQuestion(pool,kind,level){
    let candidates=questionPool.filter(q=>(!kind||q.kind===kind)&&level.includes(q.lv));
    if(!candidates.length)candidates=questionPool.filter(q=>!kind||q.kind===kind);
    let fresh=candidates.filter(q=>!seenQuestions.has(q.q));
    if(!fresh.length)fresh=candidates;
    const q=sample(fresh);seenQuestions.add(q.q);
    const answers=shuffle(q.a.map((text,i)=>({text,correct:i===q.ok})));
    return {...q,a:answers.map(x=>x.text),ok:answers.findIndex(x=>x.correct)};
  }
  function buildInterviewPlan(level){
    if(level==='middle')return [drawQuestion(null,null,['middle'])];
    if(level==='middleplus')return [drawQuestion(null,null,['middleplus','middle']),drawQuestion(null,'code',['middleplus','middle'])];
    if(level==='senior')return [drawQuestion(null,null,['senior','middleplus']),drawQuestion(null,'code',['senior','middleplus']),drawQuestion(null,Math.random()<.5?'design':'incident',['senior','middleplus'])];
    return [drawQuestion(null,null,['lead','senior']),drawQuestion(null,'code',['senior','middleplus']),drawQuestion(null,'incident',['lead','senior']),drawQuestion(null,'design',['lead','senior','middleplus'])];
  }
  function questionSeconds(q){const basic=q.kind==='code'?120:q.kind==='incident'?100:q.kind==='design'?100:60;return basic+(q.q.length>115?12:0)+(Math.max(...q.a.map(x=>x.length))>150?12:0);}
  function startInterview(id){
    if(mode!=='running')return;
    const v=jobById(id);
    if(!v){toast('Эту вакансию уже успели закрыть.');return;}
    interview={vacancyId:id,plan:buildInterviewPlan(v.level),index:0};
    addLog('Начато собеседование: '+companyById(v.companyId).name+' ('+v.roleName+').');
    renderQuestion();
  }
  function renderQuestion(){
    if(!interview)return;
    const v=jobById(interview.vacancyId);
    if(!v){interview=null;closeDialog();return;}
    const q=interview.plan[interview.index];questionRemaining=questionSeconds(q);
    const typelabel={theory:'Теория',code:'Код / алгоритмы',incident:'Production-инцидент',design:'System Design'}[q.kind]||'Теория';
    showDialog(`<div class="jg-dialog-kicker">ТЕХНИЧЕСКОЕ СОБЕСЕДОВАНИЕ</div>
      <h3>${safe(companyById(v.companyId).name)} <em>· ${safe(v.roleLabel)}</em></h3>
      <div class="jg-interview-meta"><span>${fmt(v.salary)}/мес.</span><span>Вопрос ${interview.index+1} из ${interview.plan.length}</span><span>${typelabel}</span><span>${safe(q.section||'Java / Backend')}</span></div>
      <p class="jg-question">${safe(q.q)}</p>
      ${q.code?`<pre class="jg-code">${safe(q.code)}</pre>`:''}
      <div class="jg-answers">${q.a.map((a,i)=>`<button type="button" data-answer="${i}" class="jg-answer"><kbd>${'АБВГ'[i]}</kbd><span>${safe(a)}</span></button>`).join('')}</div>
      <div class="jg-timer-track"><div id="jg-question-timer" class="jg-timer-fill"></div></div>
      <div id="jg-question-time-text" class="jg-timer-text">Осталось ${questionRemaining} секунд · время города остановлено</div>`,'interview');
  }
  function answerInterview(answerIndex){
    if(mode!=='interview'||!interview)return;
    const {vacancyId,plan,index}=interview;
    const q=plan[index],v=jobById(vacancyId);
    if(!v){interview=null;closeDialog();return;}
    if(answerIndex===q.ok){
      interview.index++;
      if(interview.index<plan.length){renderQuestion();return;}
      interview=null;
      const c=companyById(v.companyId);const old=job;
      job={companyId:c.id,roleName:v.roleName,roleLabel:v.roleLabel,paidSalary:v.salary};
      hiredAtMonth=month;skill++;
      removeVacancy(vacancyId,'hired');renderAll();
      addLog((old?'Новая работа: ':'Первая работа: ')+c.name+', '+fmt(v.salary)+'/мес.','good');
      showDialog(`<div class="jg-dialog-kicker">СОБЕСЕДОВАНИЕ ПРОЙДЕНО ✓</div>
        <h3>Оффер из <em>${safe(c.name)}!</em></h3>
        <p>Вы правильно ответили на все ${plan.length} ${plan.length===1?'вопрос':plan.length===2?'вопроса':'вопроса'} и получили новую работу.</p>
        <div class="jg-dialog-info"><b>${safe(v.roleName)}</b><br>Зарплата: <b>${fmt(v.salary)} / мес.</b><br>Переходов/трудоустройств: <b>${skill-1}</b>.</div>
        <p>Не забывайте: через 6 игровых месяцев на одной позиции приходит ИИ.</p>
        <div class="jg-dialog-actions"><button type="button" class="jg-btn jg-btn-primary" data-action="continue">Вернуться на карту →</button></div>`,'result');
      return;
    }
    interview=null;removeVacancy(vacancyId,'failed');
    const c=companyById(v.companyId);
    addLog('В '+c.name+' собеседование не пройдено.','bad');
    const selected=answerIndex<0?'Время ответа истекло':q.a[answerIndex];
    showDialog(`<div class="jg-dialog-kicker">РАЗБОР ОШИБКИ · ПАУЗА</div>
      <h3>Оффер <em style="color:#ffb5b3">упущен.</em></h3>
      <div class="jg-interview-meta"><span>${safe(v.roleLabel)}</span><span>Вопрос ${index+1} из ${plan.length}</span><span>Время города остановлено</span><span>${safe(q.section||'Java / Backend')}</span></div>
      <p class="jg-question">${safe(q.q)}</p>
      ${q.code?`<pre class="jg-code">${safe(q.code)}</pre>`:''}
      <div class="jg-review-wrong"><b>${answerIndex<0?'Не успели ответить':'Ваш ответ:'}</b><div>${safe(selected)}</div></div>
      <div class="jg-review-correct"><b>✓ Правильный ответ</b><div>${safe(q.a[q.ok])}</div></div>
      <div class="jg-dialog-info"><b>Объяснение:</b><br>${safe(q.why)}</div>
      <p>Пока вы разбираете ответ, расходы и вакансии не изменяются. Текущая работа сохраняется, если она уже была.</p>
      <div class="jg-dialog-actions"><button type="button" class="jg-btn jg-btn-primary" data-action="continue">Понятно, искать дальше →</button></div>`,'review');
  }
  function newMonth(){
    month++;
    let fired=null;
    if(job && month-hiredAtMonth>=4){fired=job;job=null;hiredAtMonth=0;}
    const earned=job?job.paidSalary:0;
    const delta=earned-currentCost();cash+=delta;
    addLog((earned?`Зарплата ${fmt(earned)}, `:'Без зарплаты, ')+`расходы ${fmt(currentCost())}. Итого ${delta>=0?'+':''}${fmt(delta)}.`,delta>=0?'good':'bad');
    if(cash<=0){
      cash=0;renderStats();addLog('Капитал исчерпан.','bad');
      showDialog(`<div class="jg-dialog-kicker">GAME OVER</div><h3>Деньги <em style="color:#ffb4ae">закончились.</em></h3>
        <p>Вы прожили ${month} игровых месяцев. Ваши расходы превысили заработок. Попробуйте другой маршрут и грейд.</p>
        <div class="jg-dialog-actions"><button type="button" class="jg-btn jg-btn-primary" data-action="restart">Начать заново ↻</button></div>`,'lose');
      return;
    }
    renderStats();
    if(cash>=currentGoal()&&!startupUnlocked){
      startupUnlocked=true;$('jg-startup').classList.remove('jg-hidden');showStartupChoice();return;
    }
    if(fired){
      addLog('ИИ заменил сотрудника в '+companyById(fired.companyId).name+'.','bad');
      renderOffices();
      showDialog(`<div class="jg-dialog-kicker">ПИСЬМО ОТ HR · AI AUTOMATION</div>
        <h3>Вас <em style="color:#ffb2ad">заменил ИИ.</em></h3>
        <p>Вы проработали в <b>${safe(companyById(fired.companyId).name)}</b> шесть месяцев и не перешли на новую позицию. Компания автоматизировала вашу роль.</p>
        <div class="jg-dialog-alert">Доход теперь 0 ₽/мес., но расходы <b>${fmt(currentCost())}</b> продолжаются каждые 5 секунд.</div>
        <p>Найдите новую вакансию — карьеру можно продолжить.</p>
        <div class="jg-dialog-actions"><button type="button" class="jg-btn jg-btn-primary" data-action="continue">Искать работу →</button></div>`,'ai');
      return;
    }
    if(job && month-hiredAtMonth>=4)toast(`ИИ близко: осталось ${6-(month-hiredAtMonth)} мес. Найдите новое место!`);
  }
  function showStartupChoice(){
    showDialog(`<div class="jg-dialog-kicker">ФИНАНСОВАЯ ЦЕЛЬ ДОСТИГНУТА</div>
      <h3><em>${fmt(currentGoal())}!</em><br>Вы победили.</h3>
      <p>Вы накопили необходимый капитал на сложности «${safe(currentSetting().label)}». Ваш следующий шаг — создать собственный продукт.</p>
      <div class="jg-dialog-info">Накоплено: <b>${fmt(cash)}</b></div>
      <div class="jg-dialog-actions"><button type="button" class="jg-btn jg-btn-primary" data-action="startup-idea">🚀 Запустить свой стартап</button><button type="button" class="jg-btn jg-btn-subtle" data-action="continue">Продолжить карьеру</button></div>`,'startupChoice');
  }
  function showStartupIdea(){
    showDialog(`<div class="jg-dialog-kicker">НОВЫЙ УРОВЕНЬ</div>
      <h3>Какая у вас <em>идея стартапа?</em></h3>
      <p>В двух-трёх предложениях опишите продукт, который хотите создать.</p>
      <textarea id="jg-startup-input" class="jg-startup-textarea" maxlength="400" placeholder="Например: AI-платформа для нагрузочного тестирования Java-сервисов..."></textarea>
      <div id="jg-startup-error" class="jg-input-error"></div>
      <div class="jg-dialog-actions"><button type="button" class="jg-btn jg-btn-primary" data-action="startup-launch">Запустить проект →</button><button type="button" class="jg-btn jg-btn-subtle" data-action="startup-back">Назад</button></div>`,'startupIdea');
    $('jg-startup-input')?.focus();
  }
  function launchStartup(){
    const idea=($('jg-startup-input')?.value||'').trim();
    if(idea.length<5){$('jg-startup-error').textContent='Напишите идею хотя бы в 5 символах.';return;}
    showDialog(`<div class="jg-dialog-kicker">ПОБЕДА · НОВАЯ ГЛАВА</div>
      <h3>🎉 Поздравляем, теперь у вас <em>своё дело!</em></h3>
      <div class="jg-dialog-info"><b>Ваша идея:</b><br><span style="white-space:pre-wrap;overflow-wrap:anywhere">${safe(idea)}</span></div>
      <p>Собирайте команду, разрабатывайте MVP и встречайтесь с другими создателями продуктов в ИТ-СТАРТАП КЛУБЕ.</p>
      <div class="jg-dialog-actions"><a class="jg-btn jg-btn-primary" href="https://javaguru.by/startup" target="_blank" rel="noopener noreferrer">🚀 ИТ-СТАРТАП КЛУБ ↗</a><button type="button" class="jg-btn jg-btn-subtle" data-action="restart">Сыграть ещё раз</button></div>`,'victory');
    addLog('Вы запустили свой стартап!','good');
  }
  function resizeMap(){
    const space=mapWindow.clientWidth;
    const mobile=window.innerWidth<710;
    mapScale=Math.min(1,Math.max(mobile?.80:.61,space/W));
    mapSizer.style.width=W*mapScale+'px';mapSizer.style.height=H*mapScale+'px';
    mapWorld.style.transform='scale('+mapScale+')';
  }
  function reset(){
    paused=false;mode='intro';month=1;monthElapsed=0;
    cash=currentSetting().start;skill=1;job=null;hiredAtMonth=0;
    simSeconds=0;serial=1;nextSpawn=rand(2.4,4);
    playerTargetId=null;pointTarget=null;interview=null;startupUnlocked=false;
    feed=[];toastLeft=0;framePrevious=performance.now();followTime=0;lastContact=null;
    keys.clear();touchKeys.clear();
    companies.forEach(c=>{c.jobs=[];});
    player.x=560;player.y=577;
    playerNode.style.left=player.x+'px';playerNode.style.top=player.y+'px';
    initializeRivals();
    // Стартовые вакансии разных грейдов и компаний.
    const roles=[ROLES[0],ROLES[0],ROLES[1],ROLES[1],ROLES[2],ROLES[3]];
    const shuffledCompanies=shuffle([...companies]);
    roles.forEach((role,i)=>createVacancy(shuffledCompanies[i],role));
    addLog('Свободные вакансии появились! Выберите маршрут.','good');
    renderAll();updateNearby();routeLine.style.display='none';
    $('jg-map-pause').classList.add('jg-hidden');
    $('jg-pause').textContent='Ⅱ Пауза';$('jg-startup').classList.add('jg-hidden');
    mapWindow.scrollLeft=0;resizeMap();followPlayer(true);introDialog();
  }
  function frame(now){
    if(!root.isConnected)return;
    const dt=clamp((now-framePrevious)/1000,0,.08);framePrevious=now;
    if(mode==='running'&&!paused){
      simSeconds+=dt;monthElapsed+=dt;nextSpawn-=dt;
      if(nextSpawn<=0){spawnVacancy();nextSpawn=rand(3,5.4);}
      const expired=[];
      for(const v of allJobs()){v.expires-=dt;if(v.expires<=0)expired.push(v.id);}
      expired.forEach(id=>removeVacancy(id,'expired'));
      updatePlayer(dt);
      if(mode==='running')updateRivals(dt);
      if(mode==='running'&&monthElapsed>=MONTH_SECONDS){monthElapsed-=MONTH_SECONDS;newMonth();}
    }else if(mode==='interview'){
      questionRemaining-=dt;
      const fill=$('jg-question-timer'),label=$('jg-question-time-text');
      const q=interview?.plan[interview.index];
      if(fill&&q)fill.style.width=clamp(questionRemaining/questionSeconds(q)*100,0,100)+'%';
      if(label)label.textContent='Осталось '+Math.max(0,Math.ceil(questionRemaining))+' секунд · время города остановлено';
      if(questionRemaining<=0)answerInterview(-1);
    }
    if(toastLeft>0){toastLeft-=dt;if(toastLeft<=0)$('jg-toast').classList.remove('show');}
    $('jg-countdown').textContent=(MONTH_SECONDS-monthElapsed).toFixed(1)+' с';
    requestAnimationFrame(frame);
  }

  $('jg-offices').addEventListener('click',event=>{
    const el=event.target.closest('[data-company]');if(!el||mode!=='running')return;
    if(paused){toast('Снимите игру с паузы.');return;}
    const c=companyById(el.dataset.company);
    if(!c.jobs.length){toast('В '+c.name+' сейчас нет вакансий.');return;}
    const v=[...c.jobs].sort((a,b)=>b.salary-a.salary)[0];
    runTo(v.id);
  });
  $('jg-offer-list').addEventListener('click',event=>{
    const btn=event.target.closest('[data-run]');if(btn)runTo(btn.dataset.run);
  });
  mapWorld.addEventListener('pointerdown',event=>{
    mousePointStart={x:event.clientX,y:event.clientY,at:performance.now()};
  });
  mapWorld.addEventListener('click',event=>{
    if(event.target.closest('[data-company]')||mode!=='running'||paused)return;
    if(mousePointStart&&Math.hypot(event.clientX-mousePointStart.x,event.clientY-mousePointStart.y)>10)return;
    const r=mapWorld.getBoundingClientRect();
    moveToPoint((event.clientX-r.left)/mapScale,(event.clientY-r.top)/mapScale);
  });
  const keyMap={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',
    KeyW:'up',KeyS:'down',KeyA:'left',KeyD:'right'};
  window.addEventListener('keydown',event=>{
    const dir=keyMap[event.code];
    if(event.code==='KeyE'&&mode==='running'&&!paused&&gameInView){
      const tag=(event.target?.tagName||'').toUpperCase();
      if(!['INPUT','TEXTAREA','SELECT'].includes(tag)){event.preventDefault();interactNearby();}
      return;
    }
    if(!dir||mode!=='running'||paused||!gameInView)return;
    const tag=(event.target?.tagName||'').toUpperCase();
    if(['INPUT','TEXTAREA','SELECT'].includes(tag))return;
    event.preventDefault();keys.add(dir);
  });
  window.addEventListener('keyup',event=>{if(keyMap[event.code])keys.delete(keyMap[event.code]);});
  window.addEventListener('blur',()=>{keys.clear();touchKeys.clear();});
  $('jg-move-controls').addEventListener('pointerdown',event=>{
    const b=event.target.closest('[data-move]');
    if(!b||mode!=='running'||paused)return;
    event.preventDefault();touchKeys.add(b.dataset.move);
    try{b.setPointerCapture(event.pointerId);}catch(e){}
    b.classList.add('jg-pressed');
  });
  const clearControl=(event)=>{
    const b=event.target.closest('[data-move]');if(!b)return;
    touchKeys.delete(b.dataset.move);b.classList.remove('jg-pressed');
  };
  $('jg-move-controls').addEventListener('pointerup',clearControl);
  $('jg-move-controls').addEventListener('pointercancel',clearControl);
  $('jg-move-controls').addEventListener('lostpointercapture',clearControl);
  $('jg-dialog').addEventListener('click',event=>{
    const diff=event.target.closest('[data-difficulty]');if(diff){chooseDifficulty(diff.dataset.difficulty);return;}
    const answer=event.target.closest('[data-answer]');if(answer){answerInterview(Number(answer.dataset.answer));return;}
    const action=event.target.closest('[data-action]')?.dataset.action;
    if(!action)return;
    if(action==='start'){
      cash=currentSetting().start;renderStats();closeDialog();return;
    }
    if(action==='continue'){closeDialog();return;}
    if(action==='restart'){reset();return;}
    if(action==='startup-idea'){showStartupIdea();return;}
    if(action==='startup-back'){showStartupChoice();return;}
    if(action==='startup-launch'){launchStartup();return;}
  });
  $('jg-interact').addEventListener('click',interactNearby);
  $('jg-help').addEventListener('click',helpDialog);
  $('jg-startup').addEventListener('click',()=>{if(mode==='running'&&!paused&&startupUnlocked)showStartupChoice();});
  $('jg-pause').addEventListener('click',()=>{
    if(mode!=='running')return;
    paused=!paused;keys.clear();touchKeys.clear();
    $('jg-pause').textContent=paused?'▶ Продолжить':'Ⅱ Пауза';
    $('jg-map-pause').classList.toggle('jg-hidden',!paused);
  });
  window.addEventListener('resize',resizeMap);
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(resizeMap).observe(mapWindow);
  if(typeof IntersectionObserver!=='undefined'){
    gameInView=false;
    new IntersectionObserver(entries=>{
      gameInView=entries[0].isIntersecting;
      if(mode==='intro')$('jg-overlay').classList.toggle('jg-hidden',!gameInView);
    },{threshold:.04}).observe(root);
  }
  createOffices();
  decodeQuizBank().then(()=>{
    reset();
    requestAnimationFrame(t=>{framePrevious=t;requestAnimationFrame(frame);});
  }).catch(err=>{
    root.dataset.questionBankSize='0';
    reset();
    const container = root.querySelector('#jg-overlay');
    if(container){
      container.classList.remove('jg-hidden');
      const notice=document.createElement('div');
      notice.setAttribute('role','alert');
      notice.style.cssText='padding:12px 16px;background:#64262b;color:#fff;border-radius:8px;margin:12px;text-align:center;position:relative;z-index:20';
      notice.textContent='Не удалось загрузить questions.json. Проверьте публикацию всех файлов на GitHub Pages. ' + err;
      container.appendChild(notice);
    }
    requestAnimationFrame(t=>{framePrevious=t;requestAnimationFrame(frame);});
  });
})();

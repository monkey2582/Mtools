/**
 * Mtools v1.5.0 — TypeScript 类型声明
 *
 * 通用工具函数库（不含弹窗 UI），共 80 个内置工具。
 *
 * 用法（CommonJS / AMD / 浏览器全局三端）：
 *   import Mtools = require('mtools');           // CommonJS/TS
 *   Mtools.random(1, 10)                          // 属性调用
 *   Mtools("random", 1, 10)                       // 工具名派发
 *   Mtools(() => { ... })                         // DOM ready（等价 jQuery ready）
 *   Mtools("#btn")                                // 选择器取元素（支持穿透 shadow DOM）
 *   Mtools.ready(fn).on(el, "click", cb)          // 动作方法返回自身，可链式
 *   Mtools.alias(true)                            // 启用全局别名 M（M 与 Mtools 同类型）
 *
 * 别名 M 的类型说明：alias(true) 为运行时行为，声明文件不预设全局 M；
 * 若在 TS 中使用 M，可在项目里自行声明（与 Mtools 同型）：
 *   declare const M: Mtools.Static;
 *
 * 注意：
 *   - 工具参数不合法时统一抛出 Error（消息含工具名与实参，带完整堆栈），不再返回 "error" 字符串；
 *   - $ 与选择器入口支持穿透已打开的 shadow DOM；
 *   - 涉及 DOM/浏览器能力的方法需要 TS lib 包含 "DOM"（tsconfig.lib 加 "DOM"）。
 */
export = Mtools;
export as namespace Mtools;

declare const Mtools: Mtools.Static;

declare namespace Mtools {
  /** 任意工具函数 */
  type ToolFn = (...args: any[]) => any;

  /** 百分比数值对象：String(pct('50%')) === '50%'，数值运算取 0.5 */
  interface Pct extends Number {
    /** 返回原百分比字符串，如 "50%" */
    toString(): string;
  }

  /** $ 返回的集合：数组形态 + item() 兼容 */
  interface ElementCollection extends Array<Element> {
    /** 取第 index 个元素，越界返回 null */
    item(index: number): Element | null;
  }

  /** on 的事件注册选项 */
  interface OnOptions {
    /** 键盘事件 repeat 过滤（组合键模式有效） */
    repeat?: boolean;
    once?: boolean;
    passive?: boolean;
    capture?: boolean;
  }

  /** create 工具配置 */
  interface CreateOptions {
    /** 标签名，如 "div" / "img" / "input" */
    element: string;
    id?: string;
    class?: string;
    title?: string;
    /** element === "img" 时生效 */
    alt?: string;
    /** element 为 input/textarea 时生效（占位符） */
    place?: string;
  }

  /** 防抖/节流包装结果 */
  type Debounced<F extends (...args: any[]) => any> = ((...args: Parameters<F>) => void) & {
    /** 取消尚未执行的调用 */
    cancel(): void;
  };

  /** audio 返回的播放器控制对象 */
  interface AudioController {
    el: HTMLAudioElement;
    play(): Promise<void>;
    /** 暂停；支持链式 */
    pause(): AudioController;
    /** 停止并回到开头；支持链式 */
    stop(): AudioController;
    setVolume(volume: number): AudioController;
    seek(time: number): AudioController;
    on(event: string, handler: EventListener): AudioController;
    readonly duration: number;
    readonly currentTime: number;
    readonly paused: boolean;
    readonly volume: number;
  }

  /** queue 返回的串行队列 */
  interface Queue {
    /** 追加任务（串行执行），返回该任务的结果 Promise */
    push<T = void>(task: () => T | PromiseLike<T>): Promise<T>;
    /** 排队中任务数 */
    size(): number;
    /** 队列是否空闲 */
    idle(): boolean;
    /** 清空队列（已排队任务不再执行） */
    clear(): void;
    /** 队列尾追加回调 */
    then<R = void>(onfulfilled?: () => R | PromiseLike<R>): Promise<R>;
  }

  /** ajax 请求选项 */
  interface AjaxOptions {
    url: string;
    /** GET / POST / PUT / DELETE ... */
    method?: string;
    /** 请求体：对象自动 JSON 序列化；GET/DELETE 对象转为查询串 */
    data?: any;
    timeout?: number;
    responseType?: XMLHttpRequestResponseType;
    headers?: Record<string, string>;
  }

  /** ajax 响应 */
  interface AjaxResponse<T = any> {
    status: number;
    data: T;
    xhr: XMLHttpRequest;
  }

  /** store 存储类型：1=local 2=session 3=cookie 4=idb，或名字 */
  type StoreType = number | string;

  /**
   * 库主入口（可调用对象）
   */
  interface Static {
    /* ============ 可调用入口 ============ */

    /** jQuery 风格：DOM ready 回调（等价 Mtools.ready），返回自身可链式 */
    (callback: () => void): Static;
    /** jQuery 风格：DOM 对象/document/window 直接返回 */
    <T extends Element | Document | Window>(el: T): T;
    /** jQuery 风格：选择器取首个匹配元素（支持穿透 shadow DOM），无匹配返回 null */
    (selector: string): Element | null;
    /** 工具名派发，如 Mtools("random", 1, 10)；单字符串与内置工具同名时按工具处理 */
    (tool: string, ...args: unknown[]): any;

    /* ============ 库方法与动作（可链式） ============ */

    /** DOM ready（与 Mtools(fn) 等价）；链式 */
    ready(callback: () => void): Static;
    /** 绑定事件（events 支持空格分隔多个及修饰键组合，如 "click"、"keydown"、"ctrl+click"）；链式 */
    on(target: EventTarget, events: string, handler: EventListener, options?: OnOptions): Static;
    on(target: EventTarget, events: string, name: string, handler: EventListener, options?: OnOptions): Static;
    on(selector: string, events: string, handler: EventListener, options?: OnOptions): Static;
    on(selector: string, events: string, name: string, handler: EventListener, options?: OnOptions): Static;
    /** 解绑事件（events 同上）；链式 */
    off(target: EventTarget, events: string): Static;
    off(target: EventTarget, events: string, handler: EventListener): Static;
    off(target: EventTarget, events: string, name: string): Static;
    off(selector: string, events: string, handler?: EventListener): Static;
    /** 触发事件；返回是否成功派发 */
    trigger(target: EventTarget, events: string, detail?: any): boolean;
    trigger(selector: string, events: string, detail?: any): boolean;
    /** 注册自定义工具；链式 */
    creatTool(name: string, fn: ToolFn): Static;
    /** creatTool 别名 */
    createTool(name: string, fn: ToolFn): Static;
    /** 无参：查询是否已启用全局别名 M */
    alias(): boolean;
    /** 启用/禁用全局别名 M；链式 */
    alias(enable: boolean): Static;
    /** 内置工具名列表 */
    tools(): string[];
    /** 库版本号 */
    readonly version: string;

    /* ============ 内置工具 ============ */

    /** 跳转新地址 */
    open(url: string): void;
    /** 随机数：min/max 自动交换，相等时返回该值；precision 小数位 0-15 */
    random(min?: number, max?: number, precision?: number): number;
    /** 是否 PC（非移动设备 UA） */
    isPC(): boolean;
    /** 是否手机（UA） */
    isPhone(): boolean;
    /** 是否 iPad（UA） */
    isPad(): boolean;
    /** 设备类型："pad" | "phone" | "PC" | "未知设备" */
    getUA(): 'pad' | 'phone' | 'PC' | '未知设备';
    /** HTML 转义（& < > " '） */
    escapeHtml(html: string): string;
    /** 网络是否在线（navigator.onLine） */
    isOnline(): boolean;
    /** 是否偶数 */
    isEven(n: number): boolean;
    /** 是否奇数 */
    isOdd(n: number): boolean;
    /** isOnline 小写别名 */
    isonline(): boolean;
    /** 控制 contextmenu 默认行为（浏览器环境） */
    curm(disable?: boolean): boolean;
    /** Base64 编码（UTF-8 安全） */
    base64(input: string): string;
    /** 格式化 JSON 字符串（2 空格缩进）；解析失败返回 "error:..." 描述串 */
    formatjson(json: string): string;
    /** HTML → Markdown */
    htmltomd(html: string): string;
    /** Markdown → HTML */
    mdtohtml(md: string): string;
    /** 写入本地存储（值 JSON 序列化） */
    setData(key: string, value: any): true;
    /** 读取本地存储（自动 JSON 解析，无则 null） */
    getData<T = any>(key: string): T | null;
    /** 删除单个键 */
    clearData(key: string): true;
    /** 读取全部键值 */
    getAllData<T = any>(): Record<string, T>;
    /** 清空全部（弹窗确认） */
    clearAllData(): boolean;
    /** 存储统一入口：1=set 2=get 3=del 4=all 5=clear */
    data(mode: 1, key: string, value: any): true;
    data<T = any>(mode: 2, key: string): T | null;
    data(mode: 3, key: string): true;
    data<T = any>(mode: 4): Record<string, T>;
    data(mode: 5): boolean;
    /** 进入/退出全屏 */
    toFullScreen(el: Element, enable: boolean): boolean;
    /** 创建并追加元素到 body */
    create(options: CreateOptions): true;
    /** 屏幕常亮控制：KeepScreenOn(false) 开启，KeepScreenOn()/true 关闭 */
    KeepScreenOn(disable?: boolean): Promise<boolean>;
    /** 动态加载 js/css（inline 为 true 时以源码注入） */
    load(source: string, type: 'js' | 'css', inline?: boolean): boolean;
    /** 十六进制色 → rgb() 字符串；非法返回 null */
    hexToRgb(hex: string): string | null;
    /** RGB → 十六进制色；非法返回 null */
    rgbToHex(r: number, g: number, b: number): string | null;
    rgbToHex(rgb: string): string | null;
    rgbToHex(rgb: { r: number; g: number; b: number }): string | null;
    /** 选择器查询（支持穿透已打开的 shadow DOM），返回数组+item() 的集合 */
    $(selector: string): ElementCollection;
    /** 任意值 → 可读字符串（循环引用显示 [Circular]） */
    JSONToString(value: any): string;
    /** 复制文本到剪贴板 */
    copy(text: string): boolean | Promise<void>;
    /** 字符串/DOM 元素是否包含指定文本 */
    ishave(source: string | Element, search: string): boolean;
    /** ishave 取反 */
    isnothave(source: string | Element, search: string): boolean;
    /** 类型判断：是否 HTMLElement */
    isEle(value: unknown): value is HTMLElement;
    /** 是否 HTMLInputElement */
    isIpt(value: unknown): value is HTMLInputElement;
    /** 是否 HTMLTextAreaElement */
    isArea(value: unknown): value is HTMLTextAreaElement;
    /** 是否 HTMLSelectElement */
    isSelect(value: unknown): value is HTMLSelectElement;
    /** 是否 Date */
    isDate(value: unknown): value is Date;
    /** 是否数组 */
    isArr(value: unknown): value is any[];
    /** 是否对象（instanceof Object） */
    isObj(value: unknown): value is object;
    /** 是否 RegExp */
    isReg(value: unknown): value is RegExp;
    /** 延时（毫秒） */
    sleep(ms: number): Promise<void>;
    /** 取反：-(Number(value)) */
    opsite(value: number | string): number;
    /** 绝对值 */
    abs(value: number | string): number;
    /** 百分比对象：pct('50%') 数值为 0.5，String() 为 "50%" */
    pct(input: string | number): Pct;
    /** 防抖（默认 300ms；immediate 为 true 时首次立即执行）；返回带 cancel 的包装 */
    debounce<F extends (...args: any[]) => any>(fn: F, wait?: number, immediate?: boolean): Debounced<F>;
    /** 节流（默认 300ms）；返回带 cancel 的包装 */
    throttle<F extends (...args: any[]) => any>(fn: F, wait?: number): Debounced<F>;
    /** 日期格式化，默认 "YYYY-MM-DD HH:mm:ss"；支持 YYYY/YY/MM/DD/HH/mm/ss/SSS/hh/M/D/H/tt */
    fmtDate(date?: Date | string | number, format?: string): string;
    /** 解析查询参数：给 key 返回值/null，不给返回全部对象；url 缺省用 location.search */
    query(key: string, url?: string): string | null;
    query(url?: string): Record<string, string>;
    /** 深拷贝（支持循环引用/Date/RegExp/Map/Set） */
    deepClone<T>(value: T): T;
    /** 数组去重 */
    uniq<T>(arr: T[]): T[];
    /** 原地洗牌副本 */
    shuffle<T>(arr: T[]): T[];
    /** 分块 */
    chunk<T>(arr: T[], size: number): T[][];
    /** 求和；可指定数字 key 或提取函数 */
    sum(arr: number[]): number;
    sum<T extends object>(arr: T[], by: keyof T): number;
    sum<T>(arr: T[], by: (item: T, index: number, arr: T[]) => number): number;
    /** 通用 XHR 请求，返回 Promise */
    ajax<T = any>(options: AjaxOptions | string): Promise<AjaxResponse<T>>;
    /** GET 请求 */
    get<T = any>(url: string, data?: any, options?: Partial<Omit<AjaxOptions, 'url' | 'method'>>): Promise<AjaxResponse<T>>;
    /** POST 请求 */
    post<T = any>(url: string, data?: any, options?: Partial<Omit<AjaxOptions, 'url' | 'method'>>): Promise<AjaxResponse<T>>;
    /** PUT 请求 */
    put<T = any>(url: string, data?: any, options?: Partial<Omit<AjaxOptions, 'url' | 'method'>>): Promise<AjaxResponse<T>>;
    /** 音频播放器 */
    audio(src: string, options?: { volume?: number; loop?: boolean; autoplay?: boolean }): AudioController;
    /** 串行任务队列 */
    queue(): Queue;
    /** 存储：type 1-4 或 local/session/cookie/idb */
    store(type: StoreType, action: 'set', key: string, value: any): Promise<true>;
    store<T = any>(type: StoreType, action: 'get', key: string): Promise<T | null>;
    store(type: StoreType, action: 'del' | 'remove', key: string): Promise<true>;
    store(type: StoreType, action: 'clear'): Promise<true>;
    store<T = any>(type: StoreType, action: 'all'): Promise<Record<string, T>>;
    /** 邮箱校验 */
    isEmail(str: string): boolean;
    /** URL 校验（http/https/ftp，含 localhost/IP） */
    isURL(str: string): boolean;
    /** 中国大陆手机号 */
    isCNPhone(str: string): boolean;
    /** 固话/400/800 */
    isTel(str: string): boolean;
    /** 身份证号（15/18 位，含校验位） */
    isIDCard(str: string): boolean;
    /** 邮编（6 位数字） */
    isPostCode(str: string): boolean;
    /** IPv4 / IPv6 */
    isIP(str: string): boolean;
    /** 全中文 */
    isChinese(str: string): boolean;
    /** 空值判断（null/undefined/空串/NaN/空数组/空对象/无效 Date 等） */
    isEmpty(value: any): boolean;
    /** 是否合法 JSON 字符串 */
    isJSON(str: string): boolean;
    /** 数字（number 或数字字符串，含科学计数） */
    isNum(value: number | string): boolean;
    /** 整数（number 或整数字符串） */
    isInt(value: number | string): boolean;
    /** 随机抽取：单元素、数量、权重、是否去重（unique 默认 true） */
    choice<T>(list: T[]): T;
    choice<T>(list: T[], weights: number[]): T;
    choice<T>(list: T[], count: number, unique?: boolean): T[];
    choice<T>(list: T[], weights: number[], count: number, unique?: boolean): T[];
    /** 随机布尔：概率 0-1 或百分比字符串；缺省 50% */
    randomBool(probability?: number | string): boolean;
    /** 随机字符串：pool 为字符池/数组，length 为长度，unique 是否不重复 */
    randomStr(pool: string | readonly string[], length?: number, unique?: boolean): string;
  }
}
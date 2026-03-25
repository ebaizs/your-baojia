
// 项目数据结构
let projectData = {
    projectName: "",
    home: {
        base: [],
        auxiliary: [],
        furniture: [],
        other: []
    },
   library: [],
    spaces: {
        home: [
            "客厅", "餐厅", "客餐厅", "主卧室", "次卧室", "小卧室","儿童房", "书房",
            "厨房", "卫生间", "阳台", "玄关", "走廊", "衣帽间","全屋","其它","家具配饰","家电设备","其它家电","厨房电器","改造部分",
            "老人房", "客房", "储物间", "阁楼", "影音室", "健身区", "娱乐室", "地下室", "花园"
        ],
        commercial: [
            "前台", "办公区", "会议室", "经理室", "财务室",
            "茶水间", "卫生间", "走廊", "楼梯间", "电梯厅",
            "展厅", "仓库", "机房", "档案室", "休息区","全屋","改造部分",
            "培训室", "接待室", "总经理办公室", "开放办公区"
        ]
    }
};

// 项目示例库
const quickAddExamples = [
    // ============== 家装部分（保持不变）==============
    // 基础装修类（家装）
    { "name": "平面吊顶", "price": 160, "unit": "平米", "category": "base", "description": "橙色加厚型轻钢龙骨框架，泰山石膏板贴面" },
    { "name": "凹凸灯带吊顶", "price": 185, "unit": "平米", "category": "base", "description": "橙色加厚型轻钢龙骨框架，泰山石膏板贴面，详见施工图" },
    { "name": "复杂造型吊顶", "price": 235, "unit": "平米", "category": "base", "description": "橙色加厚型轻钢龙骨框架，泰山石膏板贴面，详见施工图" },
    { "name": "直线吊顶", "price": 125, "unit": "米", "category": "base", "description": "橙色加厚型轻钢龙骨框架，泰山石膏板贴面" },
    { "name": "多层叠级宽石膏线", "price": 39, "unit": "米", "category": "base", "description": "多层石膏板带叠级造型"},
    { "name": "双层叠级石膏线", "price": 28, "unit": "米", "category": "base", "description": "双层石膏板带叠级造型" },
    { "name": "暗窗帘盒", "price": 105, "unit": "米", "category": "base", "description": "欧松板基层，纸面石膏板贴面" },
    { "name": "明窗帘盒", "price": 125, "unit": "米", "category": "base", "description": "欧松板基层，纸面石膏板贴面" },
    { "name": "影视墙造型", "price": 3000, "unit": "项", "category": "base", "description": "详见施工图" },
    { "name": "墙面基层处理", "price": 29, "unit": "平米", "category": "base", "description": "墙面界面剂+石膏粉找平+腻子粉打底，顺平工艺29元/平米，冲筋工艺75元/平米" },
    { "name": "墙面乳胶漆", "price": 18, "unit": "平米", "category": "base", "description": "立邦竹炭抗甲醛净味五合一乳胶漆18元/平米，立邦净味欧倍丽乳胶漆10元/平米" },
    { "name": "顶面基层处理", "price": 29, "unit": "平米", "category": "base", "description": "墙面界面剂+石膏粉找平+腻子粉打底，顺平工艺29元/平米，冲筋工艺75元/平米" },
    { "name": "顶面乳胶漆", "price": 18, "unit": "平米", "category": "base", "description": "立邦竹炭抗甲醛净味五合一乳胶漆18元/平米，立邦净味欧倍丽乳胶漆10元/平米" },
    { "name": "木饰面墙板造型", "price": 180, "unit": "平米", "category": "base", "description": "竹木纤维高端品牌饰面板" },
    { "name": "沙发背景造型", "price": 180, "unit": "平米", "category": "base", "description": "竹木纤维高端品牌饰面板" },
    { "name": "顶面石膏线", "price": 50, "unit": "平米", "category": "base", "description": "双层石膏板造型，详见图纸" },
    { "name": "其它造型", "price": 3000, "unit": "平米", "category": "base", "description": "墙面其它造型，预估" },
    { "name": "床头造型", "price": 380, "unit": "平米", "category": "base", "description": "竹木纤维高端品牌饰面板" },
    { "name": "电路改造", "price": 7000, "unit": "项", "category": "base", "description": "预收，完工后据实结算" },
    { "name": "弱电改造", "price": 2000, "unit": "项", "category": "base", "description": "预收，电话线、音箱、网线，混凝土开槽28元每米，墙砖每米25元，明线每米20元" },
    { "name": "水路改造", "price": 2000, "unit": "项", "category": "base", "description": "预收，暗管每米68元，明管每米55元" },
    { "name": "下水改造", "price": 2000, "unit": "项", "category": "base", "description": "预收，改下水（50管）每米100元" },
    { "name": "防水施工", "price": 3000, "unit": "项", "category": "base", "description": "预收，（法国德高刚柔）防水涂料每平米55元，防水布每平米45元" },
    { "name": "墙体拆除", "price": 80, "unit": "平米", "category": "base", "description": "拆除及外运" },
    { "name": "室内墙面保温层拆除", "price": 35, "unit": "平米", "category": "base", "description": "拆除及外运" },
    { "name": "新建墙体(瓦工)", "price": 290, "unit": "平米", "category": "base", "description": "封门洞，红砖打底，轻质块+双层挂网" },
    { "name": "轻钢龙骨隔墙", "price": 110, "unit": "平米", "category": "base", "description": "75型轻钢龙骨框架，内填隔音棉，双面纸面石膏板贴面" },

    // 主材类（家装）
    { "name": "地砖", "price": 70, "unit": "平米", "category": "auxiliary", "description": "客餐厅及走廊、所有卧室、书房、厨房、阳台，含损耗及运输搬运费，800*800通体抛釉地砖，按每块45元/计价，普通款39元/块" },
    { "name": "墙砖", "price": 70, "unit": "平米", "category": "auxiliary", "description": "厨房/卫生间/阳台墙砖、卫生间地砖800*400瓷砖（800*800瓷砖一切二），含损耗及运输搬运费<br>通体抛釉瓷砖，按每块45元/计价<br>普通300*600瓷片7.5元/块" },
    { "name": "木地板", "price": 280, "unit": "平米", "category": "auxiliary", "description": "15MM实木复合地板，含安装（安心品牌）" },
    { "name": "瓷砖铺贴费", "price": 18000, "unit": "项", "category": "auxiliary", "description": "红砖包立管，墙面滚胶，瓷砖背胶，水泥砂浆，胶粉，倒角等费用，预估" },
    { "name": "地面找平费", "price": 3000, "unit": "项", "category": "auxiliary", "description": "水泥沙浆找平，预估" },
    { "name": "集成吊顶", "price": 85, "unit": "平米", "category": "auxiliary", "description": "品牌款300*600铝扣板吊顶，灯具电器另计" },
    { "name": "多合一浴霸", "price": 950, "unit": "套", "category": "auxiliary", "description": "雷士品牌，窄长条浴霸950元，普通300×600浴霸450元/套，含安装" },
    { "name": "嵌入式平板灯", "price": 120, "unit": "套", "category": "auxiliary", "description": "300×600嵌入式平板灯120元，300×300嵌入式平板灯90元，含安装" },
    { "name": "蜂窝铝板吊顶", "price": 165, "unit": "平米", "category": "auxiliary", "description": "蜂窝铝板，灯具，电器，线形灯带另算" },
    { "name": "木门", "price": 1780, "unit": "套", "category": "auxiliary", "description": "实木复合门，带挂板，含磁吸门锁、门吸等，普通款1280元" },
    { "name": "双包垭口套", "price": 129, "unit": "米", "category": "auxiliary", "description": "实木复合材质" },
    { "name": "单包套", "price": 98, "unit": "米", "category": "auxiliary", "description": "实木复合材质" },
    { "name": "推拉门", "price": 620, "unit": "平米", "category": "auxiliary", "description": "极窄边钛镁合金-钢化玻璃门，普通款520元/平米" },
    { "name": "防盗门", "price": 3000, "unit": "项", "category": "auxiliary", "description": "春天品牌防盗门" },
    { "name": "定制衣柜", "price": 980, "unit": "平米", "category": "auxiliary", "description": "品牌颗粒板基层，部分玻璃门及PET门板" },
    { "name": "定制薄柜", "price": 600, "unit": "米", "category": "auxiliary", "description": "定制薄柜制作安装" },
    { "name": "厨房柜", "price": 9500, "unit": "项", "category": "auxiliary", "description": "*米地柜、*米吊柜、石英石台面，地柜多层板基层，PET门板，普通款7800元" },
    { "name": "壁布", "price": 55, "unit": "平米", "category": "auxiliary", "description": "含损耗，含2.8M定尺计算" },
    { "name": "马桶", "price": 1080, "unit": "项", "category": "auxiliary", "description": "预估" },
    { "name": "浴室柜及镜柜", "price": 2900, "unit": "套", "category": "auxiliary", "description": "预估" },
    { "name": "花洒", "price": 1680, "unit": "项", "category": "auxiliary", "description": "枪灰色铜芯花洒，含安装" },
    { "name": "淋浴隔断", "price": 1650, "unit": "项", "category": "auxiliary", "description": "极窄边枪灰色弧形钢化玻璃隔断，含石基与安装" },
    { "name": "改地暖管", "price": 60, "unit": "平米", "category": "auxiliary", "description": "PE日丰管" },
    { "name": "地暖分水器", "price": 150, "unit": "区", "category": "auxiliary", "description": "地暖分水器" },
    { "name": "地暖回填", "price": 30, "unit": "平米", "category": "auxiliary", "description": "水泥沙浆回填" },
    { "name": "地漏", "price": 115, "unit": "只", "category": "auxiliary", "description": "潜水艇品牌，铜芯镀铬淋浴专用地漏，普通款55元/套" },
    { "name": "窗台板", "price": 1450, "unit": "项", "category": "auxiliary", "description": "2套飘窗台面，2套普通窗台板，石英石材质，普通石材980元" },
    { "name": "开关插座", "price": 2680, "unit": "项", "category": "auxiliary", "description": "德力西品牌灰色高档款开关插座，LED射灯，普通款1680元" },
    { "name": "辅助灯具", "price": 130, "unit": "套", "category": "auxiliary", "description": "欧普品牌，防眩光COB暖白光源" },
    { "name": "瓷砖美缝", "price": 3000, "unit": "项", "category": "auxiliary", "description": "预估" },
    { "name": "踢脚线", "price": 25, "unit": "米", "category": "auxiliary", "description": "实木踢脚线，普通高分子款12元/米" },
    { "name": "楼梯", "price": 12000, "unit": "项", "category": "auxiliary", "description": "预估" },
    { "name": "定制窗户", "price": 550, "unit": "平米", "category": "auxiliary", "description": "65型三层断桥铝钢化玻璃窗，含精钢网，开启扇（含内倒）" },
    { "name": "卫生间暖气片", "price": 780, "unit": "组", "category": "auxiliary", "description": "品牌铜铝复合材质，含温控阀及安装780元，普通碳钢款550元/套，含安装" },
    { "name": "暖气片", "price": 150, "unit": "片", "category": "auxiliary", "description": "品牌碳钢材质，1.8米高，含温控阀及安装，普通品牌碳钢品牌85元/片" },
    { "name": "手动晾衣架", "price": 450, "unit": "项", "category": "auxiliary", "description": "好太太铝合金手动晾衣架，含安装费" },
    { "name": "电动晾衣架", "price": 1450, "unit": "项", "category": "auxiliary", "description": "海尔品牌电动晾衣架，含安装费" },
    { "name": "其它预估项", "price": 3000, "unit": "项", "category": "auxiliary", "description": "可能未考虑到的项目，不发生部分退于甲方" },

    // 家具家电配饰类（家装）
    { "name": "中央空调", "price": 25000, "unit": "项", "category": "furniture", "description": "格力品牌，一拖五，预估" },
    { "name": "普通空调", "price": 1800, "unit": "项", "category": "furniture", "description": "预估" },
    { "name": "烟机", "price": 3000, "unit": "台", "category": "furniture", "description": "抽油烟机，含安装" },
    { "name": "炉灶", "price": 1500, "unit": "台", "category": "furniture", "description": "燃气灶具，含安装" },
    { "name": "热水器", "price": 2900, "unit": "套", "category": "furniture", "description": "含安装" },
    { "name": "小厨宝", "price": 455, "unit": "项", "category": "furniture", "description": "小厨宝370元，安装及配件费85元" },
    { "name": "洗衣机", "price": 1799, "unit": "项", "category": "furniture", "description": "智能洗烘一体洗衣机" },
    { "name": "冰箱", "price": 4599, "unit": "项", "category": "furniture", "description": "海尔智能零距离冰箱" },
    { "name": "家具", "price": 20000, "unit": "套", "category": "furniture", "description": "预估，4张卧室床，床头柜4只，三人沙发，单人沙发，沙发凳2个，茶几，电视柜，岛台餐桌，餐椅6把，书桌椅2把，负1F大板桌（配6把椅）" },
    { "name": "窗帘", "price": 4900, "unit": "项", "category": "furniture", "description": "预估" },
    { "name": "装饰画", "price": 3150, "unit": "项", "category": "furniture", "description": "预估，据实结算" },
    { "name": "配饰", "price": 2150, "unit": "项", "category": "furniture", "description": "预估，配饰，摆件等" },

    // 其它项（家装）
    { "name": "管理费", "price": 0, "unit": "项", "category": "other", "description": "按项目总金额百分比收取" },
    { "name": "设计费", "price": 6000, "unit": "项", "category": "other", "description": "象征性收取" },
    { "name": "垃圾清运费", "price": 500, "unit": "项", "category": "other", "description": "搬运到小区内物业指定地点，不含外运" },
    { "name": "开关插座安装费", "price": 500, "unit": "项", "category": "other", "description": "按项收费或按个收费，5元/个" },
    { "name": "安全措施费", "price": 0, "unit": "项", "category": "other", "description": "按项目总金额百分比收取" },
    { "name": "成品保护费", "price": 6, "unit": "平米", "category": "other", "description": "按建筑面积收取，地面防刮保护及成品柜防尘保护" },

    // ============== 公装部分（重新整理）==============
    // 基础装饰类（公装） - 去除空间名称
    { "name": "轻钢龙骨吊顶", "price": 125, "unit": "平米", "category": "base", "description": "轻钢龙骨石膏板吊顶，包含检修口，空调风口收口" },
    { "name": "矿棉板吊顶", "price": 65, "unit": "平米", "category": "base", "description": "600x600mm矿棉板，T型龙骨系统，含检修口" },
    { "name": "铝扣板吊顶", "price": 65, "unit": "平米", "category": "base", "description": "轻钢龙骨框架，8MM厚600x600mm铝扣板" },
    { "name": "铝方通吊顶", "price": 160, "unit": "平米", "category": "base", "description": "100mm宽铝方通，间距80mm，包含专用龙骨系统" },
    { "name": "钢化玻璃隔断", "price": 350, "unit": "平米", "category": "base", "description": "12mm钢化玻璃隔断，不锈钢边框，天地轴安装" },
    { "name": "夹胶玻璃隔断", "price": 450, "unit": "平米", "category": "base", "description": "10+10mm夹胶钢化玻璃，含型材及安装" },
    { "name": "防火隔断", "price": 680, "unit": "平米", "category": "base", "description": "防火石膏板隔断，达到国家防火等级要求" },
    { "name": "墙面找平", "price": 29, "unit": "平米", "category": "base", "description": "冲筋找平工艺，确保墙面平整度达到施工标准" },
    { "name": "顶面找平", "price": 32, "unit": "平米", "category": "base", "description": "冲筋找平工艺，确保顶面平整度" },    
    { "name": "墙面乳胶漆（普通）", "price": 28, "unit": "平米", "category": "base", "description": "多乐士专业工程乳胶漆，含腻子及基层处理" },
    { "name": "顶面乳胶漆（普通）", "price": 32, "unit": "平米", "category": "base", "description": "多乐士专业工程乳胶漆，含腻子及基层处理" },
    { "name": "消防改造报备", "price": 8000, "unit": "项", "category": "base", "description": "消防图纸设计、报备、验收手续" },
    { "name": "喷淋头移位", "price": 280, "unit": "个", "category": "base", "description": "专业消防公司施工，包含报验手续" },
    { "name": "烟感移位", "price": 220, "unit": "个", "category": "base", "description": "专业消防公司施工，包含报验手续" },
    { "name": "应急照明系统", "price": 180, "unit": "套", "category": "base", "description": "双头应急灯，含电池，自动切换" },

    // 主要材料类（公装） - 去除空间名称
    { "name": "地毯", "price": 90, "unit": "平米", "category": "auxiliary", "description": "方块地毯，含专用胶水及安装" },
    { "name": "地毯铺装费", "price": 18, "unit": "平米", "category": "auxiliary", "description": "专用胶水、地毯衬垫、收边条" },
    { "name": "PVC地板", "price": 120, "unit": "平米", "category": "auxiliary", "description": "2.0mm商用PVC卷材，含专用胶水及安装" },
    { "name": "自流平地面", "price": 25, "unit": "平米", "category": "auxiliary", "description": "水泥自流平，保证地面平整度" },
    { "name": "环氧地坪漆", "price": 60, "unit": "平米", "category": "auxiliary", "description": "环氧树脂地坪，含打磨、底涂、中涂、面涂" },
    { "name": "玻璃地弹门", "price": 3200, "unit": "樘", "category": "auxiliary", "description": "12mm钢化玻璃，不锈钢地弹簧，含安装调试" },
    { "name": "不锈钢踢脚线", "price": 38, "unit": "米", "category": "auxiliary", "description": "8cm高不锈钢踢脚线，含安装" },



    // 设备家具及配饰类（公装） - 去除空间名称
    { "name": "中央空调系统", "price": 850, "unit": "平米", "category": "furniture", "description": "大金VRV多联机系统，含室内机、室外机、安装" },
    { "name": "分体空调", "price": 4500, "unit": "台", "category": "furniture", "description": "格力3匹柜机，含安装及铜管" },
    { "name": "新风系统", "price": 280, "unit": "平米", "category": "furniture", "description": "松下全热交换新风系统，含管道、风口、安装" },
    { "name": "办公桌椅", "price": 1800, "unit": "套", "category": "furniture", "description": "1.6米办公桌+人体工学椅，含安装" },
    { "name": "经理办公桌", "price": 3800, "unit": "套", "category": "furniture", "description": "2.2米实木办公桌+高背椅，含安装" },
    { "name": "会议桌", "price": 2200, "unit": "米", "category": "furniture", "description": "实木会议桌，含配套会议椅" },
    { "name": "培训桌椅", "price": 580, "unit": "套", "category": "furniture", "description": "培训桌+培训椅，可折叠收纳" },
    { "name": "文件柜", "price": 850, "unit": "组", "category": "furniture", "description": "1.8米高钢制文件柜，五节柜" },
    { "name": "储物柜", "price": 680, "unit": "组", "category": "furniture", "description": "1.2米高储物柜，含隔板" },
    { "name": "前台接待台", "price": 9800, "unit": "套", "category": "furniture", "description": "大理石台面，实木柜体，含LOGO灯箱" },
    { "name": "等候区沙发", "price": 2800, "unit": "组", "category": "furniture", "description": "3+1+1沙发组合，含茶几" },
    { "name": "茶水柜", "price": 2500, "unit": "套", "category": "furniture", "description": "不锈钢台面，下柜储物，含电源插座" },
    { "name": "百叶窗帘", "price": 180, "unit": "平米", "category": "furniture", "description": "铝合金百叶帘，含轨道及安装" },
    { "name": "电动卷帘", "price": 420, "unit": "平米", "category": "furniture", "description": "遮光电动卷帘，含电机、控制器、安装" },
    { "name": "微波炉", "price": 800, "unit": "台", "category": "furniture", "description": "美的微波炉" },
    { "name": "冰箱", "price": 2800, "unit": "台", "category": "furniture", "description": "海尔双门冰箱" },
    { "name": "饮水机", "price": 1200, "unit": "台", "category": "furniture", "description": "直饮机，含安装" },
    { "name": "投影仪", "price": 6800, "unit": "套", "category": "furniture", "description": "明基投影仪，含幕布、安装" },
    { "name": "音响系统", "price": 8500, "unit": "套", "category": "furniture", "description": "会议室音响系统，含功放、音箱、话筒" },
    { "name": "视频会议系统", "price": 28000, "unit": "套", "category": "furniture", "description": "华为视频会议系统，含摄像头、麦克风、主机" },
    { "name": "监控系统", "price": 1200, "unit": "点", "category": "furniture", "description": "海康威视400万摄像头，含录像机、安装调试" },
    { "name": "门禁系统", "price": 2800, "unit": "套", "category": "furniture", "description": "指纹+刷卡门禁，含电锁、安装" },
    { "name": "网络交换机", "price": 2500, "unit": "台", "category": "furniture", "description": "24口千兆交换机" },
    { "name": "服务器机柜", "price": 3800, "unit": "套", "category": "furniture", "description": "42U标准机柜，含PDU、风扇" },
    { "name": "打印机", "price": 4500, "unit": "台", "category": "furniture", "description": "柯尼卡美能达A3彩色打印机" },
    { "name": "碎纸机", "price": 1200, "unit": "台", "category": "furniture", "description": "科密碎纸机" },
    { "name": "白板", "price": 850, "unit": "套", "category": "furniture", "description": "磁性白板，2.4x1.2米，含支架" },

    // 其它项（公装）
    { "name": "项目管理费", "price": 0, "unit": "项", "category": "other", "description": "按工程总价8%收取，包含现场管理、协调" },
    { "name": "设计费", "price": 15000, "unit": "项", "category": "other", "description": "全套施工图+效果图+现场交底" },
    { "name": "垃圾清运费", "price": 800, "unit": "项", "category": "other", "description": "建筑垃圾外运至指定地点" },
    { "name": "成品保护费", "price": 8, "unit": "平米", "category": "other", "description": "地面保护膜、门窗保护、成品家具保护" },
    { "name": "保洁费", "price": 12, "unit": "平米", "category": "other", "description": "开荒保洁，达到入住标准" },
    { "name": "材料搬运费", "price": 3000, "unit": "项", "category": "other", "description": "材料上楼及现场搬运" },
    { "name": "脚手架租赁", "price": 1800, "unit": "项", "category": "other", "description": "脚手架租赁及搭设" },
    { "name": "临时水电费", "price": 2000, "unit": "项", "category": "other", "description": "施工期间临时水电费用" },
    { "name": "消防报验费", "price": 5000, "unit": "项", "category": "other", "description": "消防设计审查、验收手续" },
    { "name": "质保金", "price": 0, "unit": "项", "category": "other", "description": "工程总价5%，质保期满后支付" }
];

// 空间产品库（用于快速模板）
const kongjianchanpin = {
    home: [
        { space: "客餐厅", name: ["平面吊顶", "直线吊顶","明窗帘盒", "多层叠级宽石膏线", "顶面石膏线",  "影视墙造型",  "沙发背景造型", "其它造型", "墙面基层处理", "墙面乳胶漆", "顶面基层处理", "顶面乳胶漆"] },
        { space: "主卧室", name: ["平面吊顶", "直线吊顶", "明窗帘盒", "床头造型", "多层叠级宽石膏线", "墙面基层处理", "墙面乳胶漆", "顶面基层处理", "顶面乳胶漆"] },
        { space: "次卧室", name: ["直线吊顶", "明窗帘盒", "多层叠级宽石膏线", "床头造型", "墙面基层处理", "墙面乳胶漆", "顶面基层处理", "顶面乳胶漆"] },
        { space: "小卧室", name: ["直线吊顶", "明窗帘盒",  "多层叠级宽石膏线", "床头造型","墙面基层处理", "墙面乳胶漆", "顶面基层处理", "顶面乳胶漆"] },
        { space: "改造部分", name: ["墙体拆除", "新建墙体(瓦工)","轻钢龙骨隔墙","电路改造", "弱电改造", "水路改造", "下水改造", "防水施工" ] },
        { space: "全屋", name: ["地砖", "墙砖", "木地板", "瓷砖铺贴费", "地面找平费","蜂窝铝板吊顶", "壁布",] },
        { space: "门及窗套", name: ["木门", "双包垭口套", "单包套", "推拉门", "防盗门"] },
        { space: "定制柜类", name: ["定制衣柜", "定制薄柜", "厨房柜"] },
        { space: "卫浴类", name: ["浴室柜及镜柜", "马桶", "花洒", "淋浴隔断"] },
        { space: "其它", name: ["改地暖管","地暖分水器","地暖回填","电动晾衣架","嵌入式平板灯","多合一浴霸","辅助灯具","开关插座","踢脚线","地漏","窗台板","楼梯","定制窗户","暖气片","卫生间暖气片","瓷砖美缝","其它预估项"] },
        { space: "家具配饰", name: ["家具","窗帘", "装饰画", "配饰"] },
        { space: "家电设备", name: ["中央空调","普通空调"] },
        { space: "厨房电器", name: ["烟机", "炉灶"] },
        { space: "其它家电", name: ["热水器","小厨宝","洗衣机","冰箱"] },
        { space: "全屋", name: ["管理费", "设计费", "开关插座安装费", "成品保护费", "垃圾清运费", "安全措施费"] }
    ],
    commercial: [
        { space: "开放办公区", name: ["铝扣板吊顶", "平面吊顶", "直线吊顶", "背景墙", "暗窗帘盒", "木饰面墙板造型", "其它造型", "墙面乳胶漆（普通）", "顶面乳胶漆（普通）"] },
        { space: "总经理办公室", name: ["平面吊顶", "直线吊顶", "木饰面墙板造型", "其它造型", "暗窗帘盒", "墙面乳胶漆（普通）", "顶面乳胶漆（普通）"] },
        { space: "经理室", name: ["平面吊顶", "暗窗帘盒","墙面乳胶漆（普通）", "顶面乳胶漆（普通）"] },
        { space: "财务室", name: ["平面吊顶", "暗窗帘盒", "墙面乳胶漆（普通）", "顶面乳胶漆（普通）"] },
        { space: "接待室", name: ["平面吊顶", "暗窗帘盒", "墙面乳胶漆（普通）", "顶面乳胶漆（普通）"] },
        { space: "会议室", name: ["平面吊顶", "暗窗帘盒", "墙面乳胶漆（普通）", "顶面乳胶漆（普通）"] },
        { space: "电器设备", name: ["中央空调系统", "分体空调", "新风系统", "门禁系统", "监控系统"] },
        { space: "门及窗套", name: ["木门","双包垭口套","单包套","推拉门","防盗门","玻璃地弹门"] },
        { space: "地面材质", name: ["地砖","墙砖", "瓷砖铺贴费","地面找平费"] },
        { space: "其它电器", name: ["碎纸机", "微波炉","冰箱", "视频会议系统","网络交换机","服务器机柜","打印机", "投影仪","音响系统","饮水机"] },
        { space: "其它", name: ["集成吊顶","壁布","嵌入式平板灯","多合一浴霸", "辅助灯具","开关插座","地漏","窗台板","不锈钢踢脚线","定制窗户","瓷砖美缝"] },
        { space: "家具配饰", name: ["等候区沙发", "经理办公桌", "等候区沙发", "办公桌椅","会议桌", "培训桌椅","文件柜","储物柜", "茶水柜", "会议桌", "培训桌椅", "电动卷帘", "百叶窗帘", "窗帘", "配饰", "装饰画"] },
        { space: "改造部分", name: ["墙体拆除","新建墙体(瓦工)","轻钢龙骨隔墙", "电路改造", "弱电改造", "水路改造", "下水改造","防水施工","消防改造报备 ", "喷淋头移位", "烟感移位 ", "应急照明系统"] },
        { space: "全屋", name: ["项目管理费", "设计费", "垃圾清运费", "成品保护费","保洁费","材料搬运费","脚手架租赁", "临时水电费", "消防报验费", "质保金"] }
    ]
};

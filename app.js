// 全局状态变量
let allCategoriesCollapsed = false;
let allSpacesCollapsed = false;
let currentType = 'home';
let currentCategory = 'base';
let collapseStates = {
    home: {
        base: false,
        auxiliary: false,
        furniture: false,
        other: false
    },
    commercial: {
        base: false,
        auxiliary: false,
        furniture: false,
        other: false
    }
};

// 初始化函数
function initPage() {
    console.log('页面初始化开始...');

    ensureProjectData();

    if (typeof loadDataFromStorage === 'function') {
        loadDataFromStorage();
    }

    detectDeviceAndSetDisplay();
    window.addEventListener('resize', detectDeviceAndSetDisplay);

    setupTabs();
    bindEventListeners();
    renderSpaceLibrary();
    updateAllSummaries();

    // 初始化项目名称输入框
    const projectNameInput1 = document.getElementById('projectNameInput');
    const projectNameInput2 = document.getElementById('projectNameInput2');
    if (projectNameInput1) projectNameInput1.value = projectData.projectName || '';
    if (projectNameInput2) projectNameInput2.value = projectData.projectName || '';

    renderProjectList('home', 'base');
    renderProjectList('home', 'auxiliary');
    renderProjectList('home', 'furniture');
    renderProjectList('home', 'other');

    setTimeout(() => {
        initializeAllSpaceFilters();
        initTableEditing();
        console.log('表格编辑功能已启用');
    }, 300);

    setTimeout(() => {
        updateCollapseButtons();
    }, 100);

    console.log('页面初始化完成');

    setTimeout(() => {
        console.log('绑定键盘快捷键监听器...');
        setupKeyboardShortcuts();
    }, 500);
    // 初始化报价记录模块
    initManualCollapse();
    initQuotationModule();
}

// 登录相关函数
async function handleLogin() {
    console.log('处理登录...');

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const loginButton = document.getElementById('login-button');
    const loginLoading = document.getElementById('login-loading');
    const loginError = document.getElementById('login-error');

    if (!username || !password) {
        loginError.textContent = '请输入用户名和密码';
        loginError.style.color = '#f59e0b';
        return;
    }

    if (loginButton) loginButton.style.display = 'none';
    if (loginLoading) loginLoading.style.display = 'block';
    if (loginError) {
        loginError.textContent = '';
        loginError.style.color = '';
    }

    try {
        let cloudUsers = [];
        try {
            cloudUsers = await loadCloudUsers();
            console.log('从云端加载用户成功');
        } catch (cloudError) {
            console.warn('云端用户加载失败，使用本地用户:', cloudError);
            cloudUsers = [];
        }

        const localUsers = [
            { username: 'qiyu', password: '8418', name: '系统管理员', isAdmin: true },
        ];

        const validUsers = [...cloudUsers, ...localUsers];
        const user = validUsers.find(u => u.username === username && u.password === password);

        if (user) {
            console.log('登录成功:', user.name);
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userName', user.name);
            sessionStorage.setItem('userRole', user.isAdmin ? 'admin' : 'user');

            if (loginError) {
                loginError.textContent = '登录成功，正在跳转...';
                loginError.style.color = '#10b981';
            }

            setTimeout(() => {
                showMainApp();
            }, 800);
        } else {
            console.log('登录失败：用户名或密码错误');
            if (loginError) {
                loginError.textContent = '用户名或密码错误';
                loginError.style.color = '#ef4444';
            }
            if (loginButton) loginButton.style.display = 'block';
            if (loginLoading) loginLoading.style.display = 'none';
        }
    } catch (error) {
        console.error('登录失败:', error);
        if (loginError) {
            loginError.textContent = '登录失败，请重试';
            loginError.style.color = '#ef4444';
        }
        if (loginButton) loginButton.style.display = 'block';
        if (loginLoading) loginLoading.style.display = 'none';
    }
}

// 快速添加项目模板
function quickAddHomeProject() {
    if (!kongjianchanpin || !kongjianchanpin.home || kongjianchanpin.home.length === 0) {
        if (kongjianchanpin.home.length === 0) {
            setDefaultExampleData();
        }

        if (kongjianchanpin.home.length === 0) {
            showNotification('未找到示例数据，请手动添加项目', 'warning');
            return;
        }
    }

    let addedCount = 0;
    let duplicateCount = 0;

    if (!projectData.home.other) {
        projectData.home.other = [];
    }

    kongjianchanpin.home.forEach(spaceData => {
        const space = spaceData.space;
        const projectNames = spaceData.name || [];

        projectNames.forEach(projectName => {
            const projectInfo = getProjectInfoByName(projectName);

            if (projectInfo) {
                const projectObj = {
                    id: generateProjectId(),
                    name: projectInfo.name,
                    unit: projectInfo.unit || "项",
                    quantity: 1,
                    price: projectInfo.price || 0,
                    total: (projectInfo.price || 0) * 1,
                    description: projectInfo.description || "",
                    space: space
                };

                let category = projectInfo.category || "base";

                if (!projectData.home[category]) {
                    projectData.home[category] = [];
                }

                if (!isProjectDuplicate('home', category, space, projectInfo.name)) {
                    projectData.home[category].push(projectObj);
                    addedCount++;
                } else {
                    duplicateCount++;
                }
            }
        });
    });

    saveDataToStorage();

    ['base', 'auxiliary', 'furniture', 'other'].forEach(category => {
        renderProjectList('home', category);
    });

    updateSummary('home');

    setTimeout(() => {
        ['base', 'auxiliary', 'furniture', 'other'].forEach(category => {
            updateSpaceFilterOptions('home', category);
        });
    }, 100);

    let message = `已添加 ${addedCount} 个示例项目`;
    if (duplicateCount > 0) {
        message += `，跳过 ${duplicateCount} 个重复项目`;
    }
    showNotification(message, 'success');
}


// 多项目添加
function addMultiProjects() {
    const selectedSpace = document.getElementById('multiSpaceArea').value.trim();
    const selectedList = document.getElementById('selected-projects-list');
    const selectedItems = selectedList.querySelectorAll('.selected-project-item');

    if (selectedItems.length === 0) {
        showNotification('请至少选择一个项目', 'warning');
        return;
    }

    if (!selectedSpace) {
        showNotification('请选择空间区域', 'warning');
        return;
    }

    let addedCount = 0;
    let duplicateCount = 0;

    const emptyState = selectedList.querySelector('.empty-state');
    if (emptyState && emptyState.parentNode) {
        emptyState.parentNode.removeChild(emptyState);
    }

    selectedItems.forEach(item => {
        const name = item.dataset.name;
        const unit = item.dataset.unit;
        const description = item.dataset.description;
        const price = parseFloat(item.dataset.price) || 0;
        const category = item.dataset.category || currentCategory;

        // 读取数量
        let qty = 1;
        if (item.dataset.quantity !== undefined && item.dataset.quantity !== '') {
            const parsed = parseFloat(item.dataset.quantity);
            if (!isNaN(parsed) && parsed > 0) {
                qty = parsed;
            }
        }

        if (isProjectDuplicate(currentType, category, selectedSpace, name)) {
            duplicateCount++;
            return;
        }

        const project = {
            id: generateProjectId(),
            name: name,
            space: selectedSpace,
            unit: unit,
            quantity: qty,           // 使用正确的数量
            price: price,
            total: price * qty,
            description: description
        };

        projectData[currentType][category].push(project);
        addedCount++;
    });
    saveDataToStorage();

    renderProjectList(currentType, currentCategory);
    updateSummary(currentType);
    updateSpaceFilterOptions(currentType, currentCategory);

    const categoryContent = document.getElementById(`${currentType}-${currentCategory}-content`);
    if (categoryContent && categoryContent.classList.contains('collapsed')) {
        toggleCategoryCollapse(currentType, currentCategory);
    }

    closeMultiModal();

    let message = `成功添加 ${addedCount} 个项目`;
    if (duplicateCount > 0) {
        message += `，跳过 ${duplicateCount} 个重复项目`;
    }
    showNotification(message, 'success');
}

// Excel导出功能
let isExporting = false;

function exportToExcel() {
    if (isExporting) {
        return;
    }

    isExporting = true;

    const hasHomeData = Object.values(projectData.home).some(arr => arr.length > 0);
    const hasCommercialData = Object.values(projectData.commercial).some(arr => arr.length > 0);

    if (!hasHomeData && !hasCommercialData) {
        showNotification('没有可导出的数据，请先添加项目', 'warning');
        isExporting = false;
        return;
    }

    const wb = XLSX.utils.book_new();
    const data = prepareSheetData();
    const ws = XLSX.utils.aoa_to_sheet(data);
    applySheetStyles(ws, data);
    XLSX.utils.book_append_sheet(wb, ws, '装饰项目报价单');

    const projectName = projectData.projectName || '未命名项目';
    const fileName = `${projectName}_装饰项目报价单_${new Date().toISOString().slice(0, 10)}.xlsx`;

    XLSX.writeFile(wb, fileName);

    showNotification('Excel表格导出成功！', 'success');

    setTimeout(() => {
        isExporting = false;
    }, 1000);
}

function prepareSheetData() {
    const type = currentType;
    const typeName = type === 'home' ? '家装' : '公装';

    function groupItemsBySpace(items) {
        const groups = {};
        items.forEach(item => {
            const space = item.space || '未指定';
            if (!groups[space]) {
                groups[space] = [];
            }
            groups[space].push(item);
        });
        return groups;
    }

    const data = [];
    data.push(['']);
    data.push([`装饰项目报价单`, '', '', '', '', '', '']);
    data.push(['']);

    const projectName = projectData.projectName || '未命名项目';
    data.push(['项目名称：' + projectName, '', '', '', '', '', '']);

    const categories = [
        { key: 'base', title: '一、基础装修', summary: '基础装修合计', noteColumn: '工艺说明' },
        { key: 'auxiliary', title: '二、主材', summary: '主材合计', noteColumn: '备注说明' },
        { key: 'furniture', title: '三、家具家电/灯具窗帘/软装配饰', summary: '家具家电等合计', noteColumn: '备注说明' },
        { key: 'other', title: '四、其它项', summary: '其它项合计', noteColumn: '备注' }
    ];

    categories.forEach(category => {
        const items = projectData[type][category.key];
        if (items.length === 0) return;

        data.push([category.title, '', '', '', '', '', '']);
        data.push(['序号', '项目名称', '单位', '数量', '单价(¥)', '小计(¥)', '备注说明']);

        const spaceGroups = groupItemsBySpace(items);

        Object.keys(spaceGroups).forEach(space => {
            data.push([space, '', '', '', '', '', '']);

            let index = 1;
            let spaceTotal = 0;

            spaceGroups[space].forEach(item => {
                data.push([
                    index++,
                    item.name,
                    item.unit,
                    item.quantity,
                    item.price.toFixed(2),
                    item.total.toFixed(2),
                    item.description || ''
                ]);
                spaceTotal += item.total;
            });

            data.push(['', '小计', '', '', '', `¥${spaceTotal.toFixed(2)}`, '']);
        });

        const categoryTotal = items.reduce((sum, item) => sum + item.total, 0);
        data.push(['', `${getCategoryName(category.key)}合计`, '', '', '', `¥${categoryTotal.toFixed(2)}`, '']);
    });

    const baseTotal = projectData[type].base.reduce((sum, item) => sum + item.total, 0);
    const auxiliaryTotal = projectData[type].auxiliary.reduce((sum, item) => sum + item.total, 0);
    const furnitureTotal = projectData[type].furniture.reduce((sum, item) => sum + item.total, 0);
    const otherTotal = projectData[type].other.reduce((sum, item) => sum + item.total, 0);
    const grandTotal = baseTotal + auxiliaryTotal + furnitureTotal + otherTotal;

    data.push(['']);
    data.push(['', '小计金额：', '', '', '', `¥${grandTotal.toFixed(2)}`, '']);

    const chineseAmount = convertCurrency(grandTotal);
    data.push(['', '大写金额：', '', '', '', chineseAmount, '']);

    data.push(['备注：', '', '', '', '', '', '']);
    data.push(['', '1. 本报价单包含人工费、材料费及管理费', '', '', '', '', '']);
    data.push(['', '2. 实际结算以实际施工量为准', '', '', '', '', '']);
    data.push(['', '3. 如有变更，需双方协商确认', '', '', '', '', '']);
    data.push(['', '4. 报价有效期30天', '', '', '', '', '']);

    return data;
}

function applySheetStyles(ws, data) {
    const range = XLSX.utils.decode_range(ws['!ref']);
    const merges = [];

    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellRef = XLSX.utils.encode_cell({ c: C, r: R });

            if (!ws[cellRef]) {
                ws[cellRef] = { v: '', t: 's' };
            }

            const cell = ws[cellRef];
            if (!cell.s) cell.s = {};

            cell.s.border = {
                top: { style: 'thin', color: { rgb: '000000' } },
                bottom: { style: 'thin', color: { rgb: '000000' } },
                left: { style: 'thin', color: { rgb: '000000' } },
                right: { style: 'thin', color: { rgb: '000000' } }
            };

            const rowData = data[R];
            if (!rowData || rowData.length === 0) continue;

            const firstCellValue = rowData[0] !== undefined ? String(rowData[0]) : '';

            if (firstCellValue.includes('装饰项目报价单') && C === 0) {
                merges.push({ s: { r: R, c: 0 }, e: { r: R, c: 6 } });
                cell.s.alignment = { horizontal: 'center', vertical: 'center' };
                cell.s.font = { bold: true, sz: 16 };
            }

            else if (firstCellValue.startsWith('项目名称：') && C === 0) {
                merges.push({ s: { r: R, c: 0 }, e: { r: R, c: 6 } });
                cell.s.alignment = { horizontal: 'left', vertical: 'center' };
                cell.s.font = { bold: true };
            }

            else if ((firstCellValue.startsWith('一、') || firstCellValue.startsWith('二、') ||
                firstCellValue.startsWith('三、') || firstCellValue.startsWith('四、')) && C === 0) {
                merges.push({ s: { r: R, c: 0 }, e: { r: R, c: 6 } });
                cell.s.alignment = { horizontal: 'left', vertical: 'center' };
                cell.s.font = { bold: true, sz: 12 };
                cell.s.fill = { fgColor: { rgb: 'E8E8E8' } };
            }

            else if (C === 0 && firstCellValue !== '' &&
                !firstCellValue.includes('装饰项目报价单') &&
                !firstCellValue.startsWith('项目名称：') &&
                !firstCellValue.startsWith('一、') &&
                !firstCellValue.startsWith('二、') &&
                !firstCellValue.startsWith('三、') &&
                !firstCellValue.startsWith('四、') &&
                firstCellValue !== '序号' &&
                firstCellValue !== '小计' &&
                firstCellValue !== '备注：' &&
                !firstCellValue.endsWith('合计') &&
                firstCellValue !== '小计金额：' &&
                firstCellValue !== '大写金额：') {

                if (rowData.length > 1 && rowData[1] === '') {
                    merges.push({ s: { r: R, c: 0 }, e: { r: R, c: 6 } });
                    cell.s.alignment = { horizontal: 'left', vertical: 'center' };
                    cell.s.font = { bold: true };
                }
            }

            else if (firstCellValue === '序号' || firstCellValue === '项目名称') {
                cell.s.font = { bold: true };
                cell.s.alignment = { horizontal: 'center' };
                cell.s.fill = { fgColor: { rgb: 'F5F5F5' } };
            }

            else if (firstCellValue === '小计') {
                if (C === 0) {
                    cell.s.font = { bold: true };
                    merges.push({ s: { r: R, c: 0 }, e: { r: R, c: 1 } });
                } else if (C === 5) {
                    cell.s.font = { bold: true };
                    cell.s.alignment = { horizontal: 'right' };
                }
            }

            else if (firstCellValue.endsWith('合计')) {
                if (C === 0) {
                    cell.s.font = { bold: true };
                    merges.push({ s: { r: R, c: 0 }, e: { r: R, c: 5 } });
                } else if (C === 5) {
                    cell.s.font = { bold: true };
                    cell.s.alignment = { horizontal: 'right' };
                    cell.s.fill = { fgColor: { rgb: 'F5F5F5' } };
                }
            }

            else if (firstCellValue === '小计金额：') {
                if (C === 0) {
                    cell.s.font = { bold: true };
                    cell.s.alignment = { horizontal: 'left' };
                } else if (C === 5) {
                    merges.push({ s: { r: R, c: 5 }, e: { r: R, c: 6 } });
                    cell.s.font = { bold: true, sz: 12 };
                    cell.s.alignment = { horizontal: 'center', vertical: 'center' };
                }
            }

            else if (firstCellValue === '大写金额：') {
                if (C === 0) {
                    cell.s.font = { bold: true };
                    cell.s.alignment = { horizontal: 'left' };
                } else if (C === 5) {
                    merges.push({ s: { r: R, c: 5 }, e: { r: R, c: 6 } });
                    cell.s.font = { bold: true, sz: 12 };
                    cell.s.alignment = { horizontal: 'center', vertical: 'center' };
                }
            }

            else if (firstCellValue === '备注：') {
                if (C === 0) {
                    merges.push({ s: { r: R, c: 0 }, e: { r: R, c: 6 } });
                    cell.s.alignment = { horizontal: 'left', vertical: 'center' };
                    cell.s.font = { bold: true };
                }
            }

            else if (C === 1 && rowData[1] && rowData[1].toString().match(/^\d+\./)) {
                merges.push({ s: { r: R, c: 1 }, e: { r: R, c: 6 } });
                cell.s.alignment = { horizontal: 'left', vertical: 'center' };
            }

            if ((C === 4 || C === 5) && cell.v && !isNaN(parseFloat(cell.v))) {
                cell.s.alignment = { horizontal: 'right' };
            }

            if (C === 6) {
                cell.s.alignment = { horizontal: 'left' };
            }
        }
    }

    ws['!merges'] = merges;

    ws['!cols'] = [
        { wch: 6 },   // A列
        { wch: 25 },  // B列
        { wch: 8 },   // C列
        { wch: 8 },   // D列
        { wch: 12 },  // E列
        { wch: 15 },  // F列
        { wch: 50 }   // G列
    ];
}

function convertCurrency(money) {
    const cnNums = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
    const cnIntRadice = ["", "拾", "佰", "仟"];
    const cnIntUnits = ["", "万", "亿", "兆"];
    const cnDecUnits = ["角", "分", "毫", "厘"];
    const cnInteger = "整";
    const cnIntLast = "元";

    let integerNum = Math.floor(money);
    let decimalNum = Math.round((money - integerNum) * 100);

    if (integerNum === 0 && decimalNum === 0) {
        return "零元整";
    }

    let chineseStr = "";

    if (integerNum > 0) {
        let zeroCount = 0;
        const integerStr = integerNum.toString();
        const integerLen = integerStr.length;

        for (let i = 0; i < integerLen; i++) {
            const n = integerStr.charAt(i);
            const p = integerLen - i - 1;
            const q = Math.floor(p / 4);
            const m = p % 4;

            if (n == '0') {
                zeroCount++;
            } else {
                if (zeroCount > 0) {
                    chineseStr += cnNums[0];
                }
                zeroCount = 0;
                chineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
            }

            if (m == 0 && zeroCount < 4) {
                chineseStr += cnIntUnits[q];
            }
        }
        chineseStr += cnIntLast;
    }

    if (decimalNum > 0) {
        const decimalStr = decimalNum.toString().padStart(2, '0');
        const jiao = decimalStr.charAt(0);
        const fen = decimalStr.charAt(1);

        if (jiao > 0) {
            chineseStr += cnNums[parseInt(jiao)] + cnDecUnits[0];
        }

        if (fen > 0) {
            chineseStr += cnNums[parseInt(fen)] + cnDecUnits[1];
        }
    } else {
        chineseStr += cnInteger;
    }

    return chineseStr;
}
// 保存当前报价（带项目名称）
function saveCurrentQuotation() {
    let records = getQuotationRecords();
    if (records.length >= 5000) {
        if (!confirm('已达到5000条记录上限，是否删除最旧的一条记录后继续保存？')) {
            return;
        }
        records.pop(); // 删除最后一条（最旧）
    }

    const projectName = projectData.projectName?.trim() || '未命名项目';
    const newRecord = {
        id: Date.now(),
        name: projectName,
        timestamp: new Date().toLocaleString('zh-CN'),
        data: JSON.parse(JSON.stringify(projectData)) // 深拷贝当前所有数据
    };
    records.unshift(newRecord); // 新记录放在最前
    saveQuotationRecords(records);
    renderQuotationRecords();
    showNotification(`成功保存报价：「${projectName}」`, 'success');
}




// 显示主应用程序
function showMainApp() {
    console.log('显示主应用');

    const userName = sessionStorage.getItem('userName') || '用户';
    const userRole = sessionStorage.getItem('userRole') || 'user';

    const loginContainer = document.getElementById('login-container');
    if (loginContainer) {
        loginContainer.style.opacity = '0';
        loginContainer.style.display = 'none';
    }

    const mainContainer = document.getElementById('main-container');
    if (mainContainer) {
        mainContainer.style.display = 'block';
        mainContainer.style.opacity = '1';
    }

    const header = document.querySelector('header h1');
    if (header) {
        header.innerHTML = `<i class="fas fa-home"></i> 装饰项目清单报价系统 <small style="font-size: 12px; color: #cbd5e1; margin-left: 10px;">用户: ${userName}</small>`;
    }

    setTimeout(() => {
        if (typeof initPage === 'function') {
            console.log('开始初始化页面');
            initPage();
            showNotification('欢迎回来！', 'success');
        } else {
            console.error('initPage 函数未定义');
        }

        setTimeout(() => {
            console.log('绑定键盘事件监听器');
            if (typeof bindEventListeners === 'function') {
                bindEventListeners();
            }
        }, 200);
    }, 100);
}

// 退出登录
function logout() {
    if (confirm('确定要退出登录吗？')) {
        sessionStorage.clear();
        location.reload();
    }
}

// 折叠/展开功能
function initManualCollapse() {
    const header = document.getElementById('manualCollapseHeader');
    const content = document.getElementById('manualCollapseContent');
    const icon = document.getElementById('manualCollapseIcon');

    if (!header || !content || !icon) {
        console.warn('手动折叠元素未找到');
        return;
    }

    // 初始设为折叠状态
    let isExpanded = false;
    content.style.display = 'none';
    icon.className = 'fas fa-chevron-right'; // 右箭头表示折叠

    header.onclick = function () {
        if (isExpanded) {
            content.style.display = 'none';
            icon.className = 'fas fa-chevron-right';
        } else {
            content.style.display = 'block';
            icon.className = 'fas fa-chevron-down';
        }
        isExpanded = !isExpanded;
    };
}

function toggleCategoryCollapse(type, category) {
    const contentId = `${type}-${category}-content`;
    const content = document.getElementById(contentId);
    const icon = document.getElementById(`collapse-${type}-${category}`);

    if (!content || !icon) return;

    const isCurrentlyCollapsed = collapseStates[type][category];
    collapseStates[type][category] = !isCurrentlyCollapsed;

    if (collapseStates[type][category]) {
        content.style.display = 'none';
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-right');
        content.classList.add('collapsed');
        showNotification(`${getCategoryName(category)}已折叠`, 'info', { compact: true });
    } else {
        content.style.display = 'block';
        icon.classList.remove('fa-chevron-right');
        icon.classList.add('fa-chevron-down');
        content.classList.remove('collapsed');
        showNotification(`${getCategoryName(category)}已展开`, 'info', { compact: true });
    }

    saveDataToStorage();
}

function toggleAllCategories() {
    console.log('toggleAllCategories 被调用, 当前状态:', allCategoriesCollapsed);

    const btn = document.getElementById('toggleAllCategoriesBtn');
    if (!btn) {
        console.error('找不到按钮: toggleAllCategoriesBtn');
        return;
    }

    const icon = btn.querySelector('i');
    const text = btn.querySelector('.btn-text');

    allCategoriesCollapsed = !allCategoriesCollapsed;
    console.log('切换后状态:', allCategoriesCollapsed);

    Object.keys(collapseStates).forEach(type => {
        Object.keys(collapseStates[type]).forEach(category => {
            collapseStates[type][category] = allCategoriesCollapsed;
            const contentId = `${type}-${category}-content`;
            const content = document.getElementById(contentId);
            const collapseIcon = document.getElementById(`collapse-${type}-${category}`);

            if (content && collapseIcon) {
                if (allCategoriesCollapsed) {
                    content.classList.add('collapsed');
                    content.style.display = 'none';
                    collapseIcon.className = 'fas fa-chevron-right';
                } else {
                    content.classList.remove('collapsed');
                    content.style.display = 'block';
                    collapseIcon.className = 'fas fa-chevron-down';
                }
            }
        });
    });

    updateCollapseButtons();
    saveDataToStorage();
}

function toggleAllSpaces() {
    const btn = document.getElementById('toggleAllSpacesBtn');
    const icon = btn.querySelector('i');
    const text = btn.querySelector('.btn-text');

    allSpacesCollapsed = !allSpacesCollapsed;

    const spaceGroups = document.querySelectorAll('.space-group');
    let changedCount = 0;

    spaceGroups.forEach(group => {
        const spaceContent = group.querySelector('.space-content');
        const collapseIcon = group.querySelector('.space-collapse-icon');

        if (spaceContent && collapseIcon) {
            if (allSpacesCollapsed) {
                if (!spaceContent.classList.contains('collapsed')) {
                    spaceContent.classList.add('collapsed');
                    collapseIcon.classList.remove('fa-chevron-down');
                    collapseIcon.classList.add('fa-chevron-right');
                    changedCount++;
                }
            } else {
                if (spaceContent.classList.contains('collapsed')) {
                    spaceContent.classList.remove('collapsed');
                    collapseIcon.classList.remove('fa-chevron-right');
                    collapseIcon.classList.add('fa-chevron-down');
                    changedCount++;
                }
            }
        }
    });

    updateCollapseButtons();
    return allSpacesCollapsed ? 'collapsed' : 'expanded';
}

function updateCollapseButtons() {
    const toggleAllBtn = document.getElementById('toggleAllCategoriesBtn');
    const toggleSpaceBtn = document.getElementById('toggleAllSpacesBtn');

    if (toggleAllBtn) {
        const icon = toggleAllBtn.querySelector('i');
        const text = toggleAllBtn.querySelector('.btn-text');
        if (icon && text) {
            icon.className = allCategoriesCollapsed ? 'fas fa-angle-double-down' : 'fas fa-angle-double-up';
            text.textContent = allCategoriesCollapsed ? '全部展开' : '全部折叠';
        }
    }

    if (toggleSpaceBtn) {
        const icon = toggleSpaceBtn.querySelector('i');
        const text = toggleSpaceBtn.querySelector('.btn-text');
        if (icon && text) {
            icon.className = allSpacesCollapsed ? 'fas fa-expand' : 'fas fa-layer-group';
            text.textContent = allSpacesCollapsed ? '空间打开' : '空间折叠';
        }
    }
}

// 标签页和界面管理
function detectDeviceAndSetDisplay() {
    const width = window.innerWidth;
    const tabsContainer = document.querySelector('.tabs-container');
    const mobileBottomBar = document.querySelector('.mobile-bottom-bar');
    const mobileTabs = document.querySelectorAll('.mobile-bottom-btn');
    const desktopTabs = document.querySelectorAll('.tab:not(.tab-export-btn)');

    if (mobileBottomBar) {
        mobileBottomBar.style.display = width <= 767 ? 'flex' : 'none';
    }

    if (tabsContainer) {
        tabsContainer.style.display = width > 767 ? 'block' : 'none';
    }

    if (width <= 767 && mobileTabs.length > 0) {
        mobileTabs.forEach((tab, index) => {
            tab.classList.remove('active');
            if (index === 0) {
                tab.classList.add('active');
            }
        });
    }

    if (width > 767 && desktopTabs.length > 0) {
        desktopTabs.forEach((tab, index) => {
            tab.classList.remove('active');
            if (index === 0) {
                tab.classList.add('active');
            }
        });
    }
}

function setupTabs() {
    detectDeviceAndSetDisplay();

    const tabs = document.querySelectorAll('.tab:not(.tab-export-btn)');
    const tabContents = document.querySelectorAll('.tab-content');
    const mobileBtns = document.querySelectorAll('.mobile-bottom-btn');

    if (tabs.length > 0 && tabContents.length > 0) {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        mobileBtns.forEach(b => b.classList.remove('active'));

        tabs[0].classList.add('active');
        mobileBtns[0].classList.add('active');
        const firstTabName = tabs[0].getAttribute('data-tab');
        const firstTabContent = document.getElementById(`${firstTabName}-tab`);
        if (firstTabContent) {
            firstTabContent.classList.add('active');
            currentType = firstTabName;
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const tabName = this.getAttribute('data-tab');
            switchToTab(tabName);
        });
    });
}

function switchToTab(tabName) {
    const width = window.innerWidth;

    document.querySelectorAll('.tab:not(.tab-export-btn)').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.mobile-bottom-btn').forEach(b => b.classList.remove('active'));

    if (width <= 767) {
        const mobileBtns = document.querySelectorAll('.mobile-bottom-btn');
        mobileBtns.forEach((btn, index) => {
            if (index === (tabName === 'home' ? 0 : tabName === 'commercial' ? 1 : 2)) {
                btn.classList.add('active');
            }
        });
    } else {
        const desktopTab = document.querySelector(`.tab[data-tab="${tabName}"]`);
        if (desktopTab) {
            desktopTab.classList.add('active');
        }
    }

    const targetTab = document.getElementById(`${tabName}-tab`);
    if (targetTab) {
        targetTab.classList.add('active');

        if (tabName === 'space') {
            renderSpaceLibrary();
        }

        if (tabName === 'home' || tabName === 'commercial') {
            currentType = tabName;
        }
    }
}

// 项目名称更新
function updateProjectNameFromInput(inputElement) {
    const value = inputElement.value.trim();
    projectData.projectName = value;
    saveDataToStorage();

    const otherInputId = inputElement.id === 'projectNameInput' ? 'projectNameInput2' : 'projectNameInput';
    const otherInput = document.getElementById(otherInputId);
    if (otherInput && otherInput.value !== value) {
        otherInput.value = value;
    }

    showNotification(`项目名称已更新: ${value}`, 'info');
}

// 模态框管理
function openAddMultiModal(type, category, presetSpace = null) {
    currentType = type;
    currentCategory = category;
    document.getElementById('selected-projects-list').innerHTML = '<div class="empty-state">未选择任何项目</div>';
    // 将预设空间传入 loadMultiSpaceOptions，确保新空间可被选中
    loadMultiSpaceOptions(presetSpace);
    if (presetSpace) {
        // 已在 loadMultiSpaceOptions 中设置选中值，无需额外操作
    } else {
        document.getElementById('multiSpaceArea').value = '';
    }
    openMultiSelectProjectLibrary();
    document.getElementById('addMultiModal').style.display = 'flex';
}

function closeMultiModal() {
    document.getElementById('addMultiModal').style.display = 'none';
}

function loadMultiSpaceOptions(presetSpace = null) {
    const spaceSelect = document.getElementById('multiSpaceArea');
    if (!spaceSelect) return;

    spaceSelect.innerHTML = '<option value="">请选择空间</option>';

    // 获取当前类型所有分类下的项目
    const categories = ['base', 'auxiliary', 'furniture', 'other'];
    let usedSpaces = new Set();

    if (projectData[currentType]) {
        categories.forEach(cat => {
            const items = projectData[currentType][cat] || [];
            items.forEach(item => {
                if (item.space && item.space.trim() !== '') {
                    usedSpaces.add(item.space.trim());
                }
            });
        });
    }

    let spaceList = Array.from(usedSpaces);
    // 如果没有任何已使用的空间，则回退到预定义空间库（保持初始可用性）
    if (spaceList.length === 0) {
        const fallbackSpaces = projectData.spaces[currentType] || [];
        spaceList = [...fallbackSpaces];
    }

    // 如果传入了预设空间（如从空间库点击传来的），且不在列表中，则加入
    if (presetSpace && presetSpace.trim() !== '' && !spaceList.includes(presetSpace)) {
        spaceList.unshift(presetSpace);
    }

    // 排序
    spaceList.sort((a, b) => a.localeCompare(b, 'zh'));

    spaceList.forEach(space => {
        const option = document.createElement('option');
        option.value = space;
        option.textContent = space;
        spaceSelect.appendChild(option);
    });

    // 如果预设空间存在，设置为选中值
    if (presetSpace && presetSpace.trim() !== '') {
        spaceSelect.value = presetSpace;
    }
}

function openMultiSelectProjectLibrary() {
    const container = document.getElementById('multi-project-library-list');
    if (!container) return;

    container.innerHTML = '';
    let filteredProjects = quickAddExamples;

    if (currentCategory) {
        filteredProjects = filteredProjects.filter(project => project.category === currentCategory);
    }

    if (filteredProjects.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无相关项目</div>';
    } else {
        filteredProjects.forEach((project, index) => {
            const div = document.createElement('div');
            div.className = 'project-library-item multi-select';
            div.innerHTML = `
                <input type="checkbox" class="project-checkbox" id="multi-project-${index}" 
                       data-name="${project.name}" 
                       data-unit="${project.unit}" 
                       data-description="${project.description || ''}"
                       data-price="${project.price || 0}"
                       data-category="${project.category || 'base'}">
                <label for="multi-project-${index}" class="project-label">
                    <div class="project-name">${project.name}</div>
                    <div class="project-unit">${project.unit}</div>
                    <div class="project-price">¥${project.price.toFixed(2)}</div>
                    <div class="project-category">${getCategoryName(project.category)}</div>
                </label>
            `;
            container.appendChild(div);
        });
    }

    document.getElementById('multiSelectProjectLibraryModal').style.display = 'flex';
}

function searchMultiProjects() {
    const searchTerm = document.getElementById('multi-project-search').value.toLowerCase();
    const container = document.getElementById('multi-project-library-list');
    if (!container) return;

    let filteredProjects = quickAddExamples;

    if (currentCategory) {
        filteredProjects = filteredProjects.filter(project => project.category === currentCategory);
    }

    if (searchTerm) {
        filteredProjects = filteredProjects.filter(project =>
            project.name.toLowerCase().includes(searchTerm) ||
            (project.description && project.description.toLowerCase().includes(searchTerm))
        );
    }

    container.innerHTML = '';

    if (filteredProjects.length === 0) {
        container.innerHTML = '<div class="empty-state">未找到相关项目</div>';
    } else {
        filteredProjects.forEach((project, index) => {
            const div = document.createElement('div');
            div.className = 'project-library-item multi-select';
            div.innerHTML = `
                <input type="checkbox" class="project-checkbox" id="multi-project-${index}" 
                       data-name="${project.name}" 
                       data-unit="${project.unit}" 
                       data-description="${project.description || ''}"
                       data-price="${project.price || 0}"
                       data-category="${project.category || 'base'}">
                <label for="multi-project-${index}" class="project-label">
                    <div class="project-name">${project.name}</div>
                    <div class="project-unit">${project.unit}</div>
                    <div class="project-price">¥${project.price.toFixed(2)}</div>
                    <div class="project-category">${getCategoryName(project.category)}</div>
                </label>
            `;
            container.appendChild(div);
        });
    }
}

function confirmMultiSelection() {
    const checkboxes = document.querySelectorAll('#multiSelectProjectLibraryModal .project-checkbox:checked');
    const selectedList = document.getElementById('selected-projects-list');

    // 如果当前列表为空状态，先清空占位符
    if (selectedList.firstChild && selectedList.firstChild.classList && selectedList.firstChild.classList.contains('empty-state')) {
        selectedList.innerHTML = '';
    }

    // 遍历新选择的项目
    checkboxes.forEach(checkbox => {
        const name = checkbox.dataset.name;
        const unit = checkbox.dataset.unit;
        const description = checkbox.dataset.description;
        const price = parseFloat(checkbox.dataset.price) || 0;
        const category = checkbox.dataset.category || 'base';

        // 检查是否已存在于当前列表中（避免重复）
        let exists = false;
        for (let i = 0; i < selectedList.children.length; i++) {
            const child = selectedList.children[i];
            if (child.dataset.name === name) {
                exists = true;
                break;
            }
        }
        if (exists) {
            showNotification(`项目“${name}”已在列表中，跳过重复`, 'warning');
            return; // 跳过当前项目
        }

        // 创建新项目项
        const projectDiv = document.createElement('div');
        projectDiv.className = 'selected-project-item';
        projectDiv.innerHTML = `
            <div>
                <strong>${name}</strong>
                <div style="font-size:0.8rem;color:#666;">
                    ${unit} | ¥${price.toFixed(2)}<br>
                    类别: ${getCategoryName(category)}<br>
                    ${description ? description.substring(0, 30) + (description.length > 30 ? '...' : '') : ''}
                </div>
            </div>
            <button class="btn btn-sm btn-outline" onclick="removeSelectedProject(this)" style="padding:2px 8px;">
                <i class="fas fa-times"></i>
            </button>
        `;
        // 存储数据属性
        projectDiv.dataset.name = name;
        projectDiv.dataset.unit = unit;
        projectDiv.dataset.description = description;
        projectDiv.dataset.price = price;
        projectDiv.dataset.category = category;
        projectDiv.dataset.quantity = 1;  // 默认数量为1

        selectedList.appendChild(projectDiv);
    });

    closeMultiSelectProjectLibrary();
}
function closeMultiSelectProjectLibrary() {
    document.getElementById('multiSelectProjectLibraryModal').style.display = 'none';
}

function openSpaceModal() {
    document.getElementById('newSpaceName').value = '';
    document.getElementById('newSpaceType').value = currentType || 'home';
    document.getElementById('spaceModal').style.display = 'flex';
}

function closeSpaceModal() {
    document.getElementById('spaceModal').style.display = 'none';
}


function addNewSpace() {
    const spaceName = document.getElementById('newSpaceName').value.trim();
    const spaceType = document.getElementById('newSpaceType').value;

    if (!spaceName) {
        showNotification('请输入空间名称', 'warning');
        return;
    }

    let exists = false;
    Object.keys(projectData.spaces).forEach(type => {
        if (projectData.spaces[type].includes(spaceName)) {
            exists = true;
        }
    });

    if (exists) {
        showNotification('该空间已存在', 'warning');
        return;
    }

    projectData.spaces[spaceType].push(spaceName);
    saveDataToStorage();
    loadMultiSpaceOptions();
    renderSpaceLibrary();
    closeSpaceModal();
    showNotification('空间已添加到库', 'success');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// 手动添加项目相关
function addManualProject() {
    const name = document.getElementById('manualProjectName').value.trim();
    const price = parseFloat(document.getElementById('manualProjectPrice').value) || 0;
    const unit = document.getElementById('manualProjectUnit').value.trim();

    // 读取数量，保留用户输入的数字（包括小数）
    let quantity = parseFloat(document.getElementById('manualProjectQuantity').value);
    if (isNaN(quantity) || quantity <= 0) quantity = 1;
    const description = document.getElementById('manualProjectDescription').value.trim();
    const selectedSpace = document.getElementById('multiSpaceArea').value.trim();
    const space = selectedSpace || '';

    if (!name || !unit || price <= 0) {
        showNotification('请填写项目名称、单位和单价', 'warning');
        return;
    }

    if (!space) {
        showNotification('请选择空间区域', 'warning');
        return;
    }

    if (isProjectDuplicate(currentType, currentCategory, space, name)) {
        showNotification(`"${space}"中已存在项目"${name}"，请勿重复添加`, 'warning');
        return;
    }
    const project = {
        id: generateProjectId(),
        name: name,
        space: space,
        unit: unit,
        quantity: quantity,      // 关键：使用读取到的数量
        price: price,
        total: price * quantity,
        description: description
    };

    addProjectToSelectedList(project);

    // 清空手动输入项（数量可以不清空，但为了方便下次输入，建议保留）
    document.getElementById('manualProjectName').value = '';
    document.getElementById('manualProjectPrice').value = '';
    document.getElementById('manualProjectDescription').value = '';
    // 数量保持原样，不清空

    showNotification('项目已添加到列表', 'success');
}

function addProjectToSelectedList(project) {
    const selectedList = document.getElementById('selected-projects-list');

    if (selectedList.firstChild && selectedList.firstChild.classList.contains('empty-state')) {
        selectedList.innerHTML = '';
    }

    const projectDiv = document.createElement('div');
    projectDiv.className = 'selected-project-item';
    projectDiv.innerHTML = `
        <div>
            <strong>${project.name}</strong>
            <div style="font-size:0.8rem;color:#666;">
                ${project.space} | ${project.unit} | 数量:${project.quantity} | 单价:¥${project.price.toFixed(2)}<br>
                ${project.description ? project.description.substring(0, 30) + (project.description.length > 30 ? '...' : '') : ''}
            </div>
        </div>
        <button class="btn btn-sm btn-outline" onclick="removeSelectedProject(this)" style="padding:2px 8px;">
            <i class="fas fa-times"></i>
        </button>
    `;
    projectDiv.dataset.name = project.name;
    projectDiv.dataset.unit = project.unit;
    projectDiv.dataset.quantity = project.quantity;
    projectDiv.dataset.price = project.price;
    projectDiv.dataset.space = project.space;
    projectDiv.dataset.description = project.description || '';

    selectedList.appendChild(projectDiv);
}

function removeSelectedProject(button) {
    const item = button.closest('.selected-project-item');
    item.remove();

    const selectedList = document.getElementById('selected-projects-list');
    if (selectedList.children.length === 0) {
        selectedList.innerHTML = '<div class="empty-state">未选择任何项目</div>';
    }
}

// 工艺说明搜索相关
function searchProjectDescription(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
        clearDescriptionSuggestions();
        return;
    }

    const term = searchTerm.toLowerCase();
    const matches = quickAddExamples.filter(item =>
        (item.description && item.description.toLowerCase().includes(term)) ||
        (item.name && item.name.toLowerCase().includes(term))
    );

    showDescriptionSuggestions(matches);
}

function showDescriptionSuggestions(matches) {
    clearDescriptionSuggestions();

    if (matches.length === 0) return;

    const inputContainer = document.getElementById('manualProjectDescription').closest('.search-box');
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.id = 'description-suggestions';
    suggestionsDiv.className = 'description-suggestions';

    matches.slice(0, 5).forEach(item => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'description-suggestion-item';
        suggestionItem.innerHTML = `
            <div class="suggestion-name">${item.name}</div>
            <div class="suggestion-description">${item.description || '无说明'}</div>
            <div class="suggestion-details">
                <span class="suggestion-unit">${item.unit}</span>
                <span class="suggestion-price">¥${item.price.toFixed(2)}</span>
            </div>
        `;

        suggestionItem.addEventListener('click', () => {
            fillManualProjectFromSuggestion(item);
            clearDescriptionSuggestions();
        });

        suggestionsDiv.appendChild(suggestionItem);
    });

    inputContainer.appendChild(suggestionsDiv);
}

function fillManualProjectFromSuggestion(item) {
    document.getElementById('manualProjectName').value = item.name || '';
    document.getElementById('manualProjectUnit').value = item.unit || '';
    document.getElementById('manualProjectPrice').value = item.price || '';
    document.getElementById('manualProjectDescription').value = item.description || '';
    document.getElementById('manualProjectQuantity').value = 1;
}

function clearDescriptionSuggestions() {
    const existingSuggestions = document.getElementById('description-suggestions');
    if (existingSuggestions) {
        existingSuggestions.remove();
    }
}
function selectSpaceFromLibrary(space) {
    // 先清除所有空间项的高亮样式
    document.querySelectorAll('.space-item').forEach(item => {
        item.classList.remove('space-item-active');
    });
    // 高亮当前点击的空间
    const clickedItem = Array.from(document.querySelectorAll('.space-item')).find(
        item => item.dataset.space === space
    );
    if (clickedItem) clickedItem.classList.add('space-item-active');

    // 打开添加项目模态框，并预设该空间
    openAddMultiModal(currentType, currentCategory, space);
}

// 空间筛选器
function filterProjectsBySpace(type, category) {
    const filterId = `${type}-${category}-space-filter`;
    const filterSelect = document.getElementById(filterId);
    if (!filterSelect) return;

    const selectedSpace = filterSelect.value;
    const container = document.getElementById(`${type}-${category}-list`);
    if (!container) return;

    const spaceGroups = container.querySelectorAll('.space-group');
    spaceGroups.forEach(group => {
        if (!selectedSpace || group.dataset.space === selectedSpace) {
            group.style.display = 'block';
        } else {
            group.style.display = 'none';
        }
    });
}

function updateSpaceFilterOptions(type, category) {
    const filterId = `${type}-${category}-space-filter`;
    const filterSelect = document.getElementById(filterId);
    if (!filterSelect) return;  // 容器不存在则直接返回

    const currentValue = filterSelect.value;
    filterSelect.innerHTML = '<option value="">全部空间</option>';

    const spaces = new Set();
    projectData[type][category].forEach(item => {
        if (item.space && item.space.trim() !== '') {
            spaces.add(item.space.trim());
        }
    });

    if (spaces.size === 0) {
        const globalSpaces = projectData.spaces[type] || [];
        globalSpaces.forEach(space => spaces.add(space));
    }

    spaces.forEach(space => {
        const option = document.createElement('option');
        option.value = space;
        option.textContent = space;
        filterSelect.appendChild(option);
    });

    if (currentValue && Array.from(spaces).includes(currentValue)) {
        filterSelect.value = currentValue;
    }
}

function initializeAllSpaceFilters() {
    ['base', 'auxiliary', 'furniture', 'other'].forEach(category => {
        updateSpaceFilterOptions('home', category);
        updateSpaceFilterOptions('commercial', category);
    });
}

// 空间组折叠
function toggleSpaceGroupCollapse(spaceNameElement) {
    if (!spaceNameElement) return;

    const spaceGroup = spaceNameElement.closest('.space-group');
    if (!spaceGroup) return;

    const spaceContent = spaceGroup.querySelector('.space-content');
    const collapseIcon = spaceGroup.querySelector('.space-collapse-icon');

    if (!spaceContent || !collapseIcon) return;

    if (spaceContent.classList.contains('collapsed')) {
        spaceContent.classList.remove('collapsed');
        spaceGroup.classList.remove('collapsed');
        collapseIcon.classList.remove('fa-chevron-right');
        collapseIcon.classList.add('fa-chevron-down');
    } else {
        spaceContent.classList.add('collapsed');
        spaceGroup.classList.add('collapsed');
        collapseIcon.classList.remove('fa-chevron-down');
        collapseIcon.classList.add('fa-chevron-right');
    }
}

// 汇总更新
function updateSummary(type) {
    const categories = ['base', 'auxiliary', 'furniture', 'other'];
    let baseTotal = 0, auxiliaryTotal = 0, furnitureTotal = 0, otherTotal = 0;

    projectData[type].base.forEach(item => baseTotal += item.total);
    projectData[type].auxiliary.forEach(item => auxiliaryTotal += item.total);
    projectData[type].furniture.forEach(item => furnitureTotal += item.total);
    projectData[type].other.forEach(item => otherTotal += item.total);

    const grandTotal = baseTotal + auxiliaryTotal + furnitureTotal + otherTotal;

    const categoryTotals = {
        'base': baseTotal,
        'auxiliary': auxiliaryTotal,
        'furniture': furnitureTotal,
        'other': otherTotal
    };

    categories.forEach(category => {
        const totalElement = document.getElementById(`${type}-${category}-total`);
        const summaryElement = document.getElementById(`${type}-${category}-summary`);
        const countElement = document.getElementById(`${type}-${category}-count`);

        if (totalElement) totalElement.textContent = `¥${categoryTotals[category].toFixed(2)}`;
        if (summaryElement) summaryElement.textContent = `¥${categoryTotals[category].toFixed(2)}`;
        if (countElement) {
            const count = projectData[type][category].length;
            countElement.textContent = `${count}个项目`;
        }
    });

    const grandTotalElement = document.getElementById(`${type}-grand-total`);
    if (grandTotalElement) grandTotalElement.textContent = `¥${grandTotal.toFixed(2)}`;
}

function updateAllSummaries() {
    updateSummary('home');
    updateSummary('commercial');
}
function quickAddProjectWithChoice() {
    const choice = confirm('请选择快速模板：\n\n确定 → 家装模板\n取消 → 公装模板');
    if (choice) {
        quickAddHomeProject();
    } else {
        quickAddCommercialToHome();  // 公装模板加载到家装
    }
}
function quickAddCommercialToHome() {
    if (!kongjianchanpin || !kongjianchanpin.commercial || kongjianchanpin.commercial.length === 0) {
        showNotification('未找到公装示例数据', 'warning');
        return;
    }

    let addedCount = 0, duplicateCount = 0;
    kongjianchanpin.commercial.forEach(spaceData => {
        const space = spaceData.space;
        const projectNames = spaceData.name || [];
        projectNames.forEach(projectName => {
            const projectInfo = getProjectInfoByName(projectName);
            if (projectInfo) {
                const category = projectInfo.category || "base";
                if (!projectData.home[category]) projectData.home[category] = [];
                if (!isProjectDuplicate('home', category, space, projectInfo.name)) {
                    projectData.home[category].push({
                        id: generateProjectId(),
                        name: projectInfo.name,
                        unit: projectInfo.unit || "项",
                        quantity: 1,
                        price: projectInfo.price || 0,
                        total: (projectInfo.price || 0) * 1,
                        description: projectInfo.description || "",
                        space: space
                    });
                    addedCount++;
                } else duplicateCount++;
            }
        });
    });

    saveDataToStorage();
    ['base', 'auxiliary', 'furniture', 'other'].forEach(cat => renderProjectList('home', cat));
    updateSummary('home');
    updateSpaceFilterOptions('home', 'base');  // 刷新空间筛选器
    showNotification(`已添加 ${addedCount} 个公装项目（到家装清单）${duplicateCount ? `，跳过 ${duplicateCount} 个重复` : ''}`, 'success');
}
// 清空项目
function clearAllProjects(type) {
    if (confirm(`确定要清空所有${type === 'home' ? '家装' : '工装'}项目吗？此操作不可撤销。`)) {
        projectData[type] = {
            base: [],
            auxiliary: [],
            furniture: [],
            other: []
        };

        if (type === 'home') {
            document.getElementById('projectNameInput').value = '';
        } else {
            document.getElementById('projectNameInput2').value = '';
        }

        projectData.projectName = '';

        saveDataToStorage();

        ['base', 'auxiliary', 'furniture', 'other'].forEach(category => {
            renderProjectList(type, category);
        });

        updateSummary(type);
        showNotification(`已清空所有${type === 'home' ? '家装' : '工装'}项目`, 'success');
    }
}

// 通知系统
function showNotification(message, type = 'success', options = {}) {
    const notificationArea = document.getElementById('notification-area');
    if (!notificationArea) return;

    const notification = document.createElement('div');
    const compact = options.compact || type === 'info';

    notification.className = `notification ${type}`;
    if (compact) {
        notification.classList.add('compact');
    }

    let icon = 'fas fa-check-circle';
    if (type === 'error') icon = 'fas fa-exclamation-circle';
    if (type === 'warning') icon = 'fas fa-exclamation-triangle';
    if (type === 'info') icon = 'fas fa-info-circle';

    notification.innerHTML = `
        <i class="${icon}"></i>
        <div style="flex: 1;">${message}</div>
    `;

    notificationArea.appendChild(notification);

    const duration = compact ? 3000 : 5000;

    setTimeout(() => {
        notification.style.animation = compact ?
            'compactNotificationSlideIn 0.3s ease-out reverse forwards' :
            'notificationSlideOut 0.3s ease-out forwards';
        setTimeout(() => {
            if (notificationArea.contains(notification)) {
                notificationArea.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// 键盘快捷键
function setupKeyboardShortcuts() {
    document.removeEventListener('keydown', handleKeyboardShortcuts);
    window.removeEventListener('keydown', handleKeyboardShortcuts);

    window.addEventListener('keydown', handleKeyboardShortcuts, true);

    console.log('键盘快捷键监听器已设置');
}

function handleKeyboardShortcuts(event) {
    if (!event.altKey) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    console.log('快捷键检测:', 'ALT+' + event.key);

    const activeElement = document.activeElement;
    const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.contentEditable === 'true'
    );

    if (isInputFocused) {
        console.log('焦点在输入元素上，跳过快捷键处理');
        return;
    }

    switch (event.key.toLowerCase()) {
        case '1':
            console.log('ALT+1 按下: 切换全部分类');
            toggleAllCategories();
            showNotification(`ALT+1: ${allCategoriesCollapsed ? '全部展开' : '全部折叠'}`, 'info');
            break;
        case '2':
            console.log('ALT+2 按下: 切换空间折叠');
            toggleAllSpaces();
            showNotification(`ALT+2: ${allSpacesCollapsed ? '空间打开' : '空间折叠'}`, 'info');
            break;
        case 'e':
            console.log('ALT+E 按下: 导出Excel');
            exportToExcel();
            showNotification('ALT+E: 导出Excel', 'info');
            break;
        case 'i':
            console.log('ALT+I 按下: 导入数据');
            importData();
            showNotification('ALT+I: 导入数据', 'info');
            break;
        case 'o':
            console.log('ALT+O 按下: 导出数据');
            exportData();
            showNotification('ALT+O: 导出数据', 'info');
            break;
        default:
            return;
    }

    return false;
}

// 事件监听器
function bindEventListeners() {
    const multiProjectSearch = document.getElementById('multi-project-search');
    if (multiProjectSearch) {
        multiProjectSearch.addEventListener('input', searchMultiProjects);
    }

    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeAllModals();
        }
    });

    // 添加快捷键支持
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// 辅助函数
function ensureProjectData() {
    if (!projectData.spaces) {
        projectData.spaces = { home: [], commercial: [] };
    }
    if (!projectData.library) {
        projectData.library = [];
    }
    // 确保 home 和 commercial 的分类结构存在
    if (!projectData.home) {
        projectData.home = { base: [], auxiliary: [], furniture: [], other: [] };
    }
    if (!projectData.commercial) {
        projectData.commercial = { base: [], auxiliary: [], furniture: [], other: [] };
    }
}

function getCategoryName(category) {
    const categoryNames = {
        'base': currentType === 'home' ? '基础装修' : '基础装修',
        'auxiliary': currentType === 'home' ? '主要材料' : '主要材料',
        'furniture': currentType === 'home' ? '家具家电及配饰' : '设备家具及配饰',
        'other': '其它项'
    };
    return categoryNames[category] || category;
}

function isProjectDuplicate(type, category, space, name) {
    const projects = projectData[type][category] || [];
    const trimmedSpace = space ? space.trim() : '';
    return projects.some(project =>
        (project.space ? project.space.trim() : '') === trimmedSpace &&
        project.name === name
    );
}

function getProjectInfoByName(name) {
    let project = quickAddExamples.find(p => p.name === name);
    if (!project && typeof kongjianchanpin !== 'undefined') {
        for (let type in kongjianchanpin) {
            for (let spaceData of kongjianchanpin[type]) {
                if (spaceData.name.includes(name)) {
                    return {
                        name: name,
                        unit: "项",
                        price: 0,
                        category: "base"
                    };
                }
            }
        }
    }
    return project;
}

function setDefaultExampleData() {
    if (!kongjianchanpin) {
        kongjianchanpin = {
            home: [],
            commercial: []
        };
    }

    if (kongjianchanpin.home.length === 0) {
        kongjianchanpin.home = [
            { space: "客厅", name: ["平面吊顶", "直线吊顶", "墙面乳胶漆"] },
            { space: "主卧室", name: ["平面吊顶", "墙面乳胶漆"] },
            { space: "改造部分", name: ["电路改造", "水路改造"] }
        ];
    }

    if (kongjianchanpin.commercial.length === 0) {
        kongjianchanpin.commercial = [
            { space: "前台", name: ["接待台基础制作", "前台区地砖"] },
            { space: "办公区", name: ["办公区隔墙", "办公区地砖"] },
            { space: "会议室", name: ["会议室背景墙", "会议桌"] }
        ];
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function () {
    console.log('页面加载完成，检查登录状态');

    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    console.log('登录状态:', isLoggedIn);

    if (isLoggedIn === 'true') {
        console.log('已登录，显示主应用');
        showMainApp();
    } else {
        console.log('未登录，显示登录界面');
        document.getElementById('login-container').style.display = 'flex';

        const loginButton = document.getElementById('login-button');
        if (loginButton) {
            loginButton.addEventListener('click', handleLogin);
        }

        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    handleLogin();
                }
            });
        }

        const usernameInput = document.getElementById('username');
        if (usernameInput) {
            usernameInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    document.getElementById('password').focus();
                }
            });
        }
    }

    // 添加窗口大小变化监听
    window.addEventListener('resize', function () {
        detectDeviceAndSetDisplay();
    });
});

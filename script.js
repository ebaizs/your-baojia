// 数据存储和加载函数
function loadDataFromStorage() {
    const saved = localStorage.getItem('decorProjectData');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            projectData = {
                ...projectData,
                ...parsed,
                home: { ...projectData.home, ...(parsed.home || {}) },
                commercial: { ...projectData.commercial, ...(parsed.commercial || {}) },
                spaces: { ...projectData.spaces, ...(parsed.spaces || {}) }
            };
            // 二次确保分类数组存在
            ['home', 'commercial'].forEach(type => {
                ['base', 'auxiliary', 'furniture', 'other'].forEach(cat => {
                    if (!projectData[type][cat]) projectData[type][cat] = [];
                });
            });
        } catch (e) {
            console.error('加载数据失败:', e);
        }
    }
}

function saveDataToStorage() {
    try {
        localStorage.setItem('decorProjectData', JSON.stringify(projectData));
    } catch (e) {
        console.error('保存数据失败:', e);
    }
}

function generateProjectId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 项目列表渲染
function renderProjectList(type, category) {
    const listId = `${type}-${category}-list`;
    const container = document.getElementById(listId);
    if (!container) {
        return;
    }

    if (!projectData[type]) {
        projectData[type] = {
            base: [],
            auxiliary: [],
            furniture: [],
            other: []
        };
    }

    if (!projectData[type][category]) {
        projectData[type][category] = [];
    }

    const items = projectData[type][category] || [];

    container.innerHTML = '';

    if (items.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-state';
        emptyDiv.textContent = '暂无项目，请添加';
        container.appendChild(emptyDiv);

        const countElement = document.getElementById(`${type}-${category}-count`);
        if (countElement) {
            countElement.textContent = '0个项目';
        }

        updateSpaceFilterOptions(type, category);
        return;
    }

    const spaceGroups = {};
    items.forEach(item => {
        const space = item.space || '未指定';
        if (!spaceGroups[space]) {
            spaceGroups[space] = [];
        }
        spaceGroups[space].push(item);
    });

    const spaceTotals = {};

    Object.keys(spaceGroups).forEach(space => {
        const spaceItems = spaceGroups[space];
        const spaceTotal = spaceItems.reduce((sum, item) => sum + (item.total || 0), 0);
        spaceTotals[space] = spaceTotal;
    });

    Object.keys(spaceGroups).forEach(space => {
        const spaceGroup = document.createElement('div');
        spaceGroup.className = 'space-group';
        spaceGroup.dataset.space = space;

        const spaceHeader = document.createElement('div');
        spaceHeader.className = 'space-header';
        spaceHeader.innerHTML = `
        <div class="space-name" onclick="toggleSpaceGroupCollapse(this)">
            <i class="fas fa-chevron-down space-collapse-icon"></i>
            <span class="space-label">${space}</span>
            <div class="space-move-arrows">
                <button class="space-arrow-up" onclick="event.stopPropagation(); moveSpaceUp('${type}', '${category}', '${space}', this)" title="上移空间">
                    <i class="fas fa-arrow-up"></i>
                </button>
                <button class="space-arrow-down" onclick="event.stopPropagation(); moveSpaceDown('${type}', '${category}', '${space}', this)" title="下移空间">
                    <i class="fas fa-arrow-down"></i>
                </button>
            </div>
        </div>
        <div class="space-total">¥${(spaceTotals[space] || 0).toFixed(2)}</div>
        <div class="space-buttons">
            <button class="space-copy-btn" 
                    onclick="event.stopPropagation(); copySpaceProjects('${type}', '${category}', '${space}', this)"
                    title="复制该空间下所有项目到其他空间">
                <i class="fas fa-copy"></i>
                <span>复制</span>
            </button>
            <button class="space-move-btn" 
                    onclick="event.stopPropagation(); moveSpaceProjects('${type}', '${category}', '${space}', this)"
                    title="将该项目转移到其他空间">
                <i class="fas fa-exchange-alt"></i>
                <span>转移</span>
            </button>
            <button class="space-delete-btn" 
                    onclick="event.stopPropagation(); deleteSpaceProjects('${type}', '${category}', '${space}')"
                    title="删除该空间下所有项目">
                <i class="fas fa-trash-alt"></i>
                <span>删除空间</span>
            </button>
        </div>
        `;

        const spaceContent = document.createElement('div');
        spaceContent.className = 'space-content';

        const headerRow = document.createElement('div');
        headerRow.className = 'item-row item-header';
        headerRow.innerHTML = `
            <div class="item-col-order">序号</div>
            <div class="item-col-arrows">调整</div>
            <div class="item-col-name">项目名称/工艺说明</div>
            <div class="item-col-unit">单位</div>
            <div class="item-col-quantity">数量</div>
            <div class="item-col-price">单价</div>
            <div class="item-col-total">小计</div>
            <div class="item-col-actions">操作</div>
        `;

        spaceContent.appendChild(headerRow);

        spaceGroups[space].forEach((item, itemIndex) => {
            const row = document.createElement('div');
            row.className = 'item-row';
            row.dataset.projectId = item.id;

            const orderNumber = itemIndex + 1;

            row.innerHTML = `
                <div class="item-col-order">${orderNumber}</div>
                <div class="item-col-arrows">
                    <div class="item-move-arrows">
                        <button class="item-arrow-up" onclick="event.stopPropagation(); moveItemUp('${type}', '${category}', '${item.id}')" title="上移项目">
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button class="item-arrow-down" onclick="event.stopPropagation(); moveItemDown('${type}', '${category}', '${item.id}')" title="下移项目">
                            <i class="fas fa-arrow-down"></i>
                        </button>
                    </div>
                </div>
                <div class="item-col-name" title="${item.description || ''}" style="cursor:pointer;">
                    <div style="font-weight:500;">${item.name || '未命名项目'}</div>
                    ${item.description ?
                    `<div style="font-size:0.8rem;color:#666;margin-top:2px;cursor:pointer;">${item.description.substring(0, 30)}${item.description.length > 30 ? '...' : ''}</div>`
                    : ''
                }
                </div>
                <div class="item-col-unit" style="cursor:pointer;">${item.unit || ''}</div>
                <div class="item-col-quantity" style="cursor:pointer;">${item.quantity || 0}</div>
                <div class="item-col-price" style="cursor:pointer;">¥${(item.price || 0).toFixed(2)}</div>
                <div class="item-col-total">¥${(item.total || 0).toFixed(2)}</div>
                <div class="item-col-actions">
                    <button class="btn btn-sm btn-danger" onclick="deleteProject('${type}', '${category}', '${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            spaceContent.appendChild(row);
        });

        spaceGroup.appendChild(spaceHeader);
        spaceGroup.appendChild(spaceContent);

        spaceContent.classList.remove('collapsed');
        spaceGroup.classList.remove('collapsed');

        container.appendChild(spaceGroup);
    });
}

// 更新表格行
function updateTableRow(project, type, category) {
    const row = document.querySelector(`[data-project-id="${project.id}"]`);
    if (!row) {
        renderProjectList(type, category);
        return;
    }

    const nameCell = row.querySelector('.item-col-name');
    const spaceCell = row.querySelector('.item-col-space');
    const unitCell = row.querySelector('.item-col-unit');
    const quantityCell = row.querySelector('.item-col-quantity');
    const priceCell = row.querySelector('.item-col-price');
    const totalCell = row.querySelector('.item-col-total');

    if (nameCell) {
        nameCell.innerHTML = `
            <strong>${project.name}</strong>
            ${project.description ? '<div style="font-size:0.8rem;color:#666;margin-top:2px;">' +
                (project.description.length > 30 ? project.description.substring(0, 30) + '...' : project.description) +
                '</div>' : ''}
        `;
    }

    if (spaceCell) spaceCell.textContent = project.space || '未指定';
    if (unitCell) unitCell.textContent = project.unit || '';
    if (quantityCell) quantityCell.textContent = project.quantity || 0;
    if (priceCell) priceCell.textContent = `¥${project.price.toFixed(2)}`;
    if (totalCell) totalCell.textContent = `¥${project.total.toFixed(2)}`;

    updateSpaceTotal(project.space, type, category);
}

function updateSpaceTotal(space, type, category) {
    const spaceGroup = document.querySelector(`[data-space="${space}"]`);
    if (!spaceGroup) return;

    const items = projectData[type][category];
    const spaceItems = items.filter(item => item.space === space);
    const spaceTotal = spaceItems.reduce((sum, item) => sum + item.total, 0);

    const spaceTotalElement = spaceGroup.querySelector('.space-total');
    if (spaceTotalElement) {
        spaceTotalElement.textContent = `¥${spaceTotal.toFixed(2)}`;
    }
}



// 表格编辑功能
function initTableEditing() {
    console.log('初始化表格编辑功能...');

    document.addEventListener('dblclick', function (e) {
        handleDoubleClick(e);
    });

    let longPressTimer = null;
    document.addEventListener('touchstart', function (e) {
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        const cell = target.closest('[class*="item-col-"]');

        if (cell && !cell.classList.contains('item-header')) {
            longPressTimer = setTimeout(() => {
                handleDoubleClick({ target: cell });
            }, 800);
        }
    });

    document.addEventListener('touchend', function () {
        clearTimeout(longPressTimer);
    });

    console.log('表格编辑功能初始化完成');
}

function handleDoubleClick(e) {
    const target = e.target || e;
    const cell = target.closest('[class*="item-col-"]');

    if (!cell) return;

    const row = cell.closest('.item-row');
    if (!row || row.classList.contains('item-header')) return;

    const projectId = row.dataset.projectId;
    if (!projectId) return;

    const container = row.closest('.item-list');
    if (!container) return;

    const containerId = container.id;
    if (!containerId) return;

    const parts = containerId.split('-');
    if (parts.length < 2) return;

    const type = parts[0];
    const category = parts[1];

    if (!projectData[type] || !projectData[type][category]) return;

    const projects = projectData[type][category];
    const project = projects.find(p => p.id === projectId);

    if (!project) return;

    const cellClass = Array.from(cell.classList).find(cls => cls.startsWith('item-col-'));

    switch (cellClass) {
        case 'item-col-price':
            editInlineCell(cell, project, type, category, 'price', 'number');
            break;
        case 'item-col-quantity':
            editInlineCell(cell, project, type, category, 'quantity', 'number');
            break;
        case 'item-col-unit':
            editInlineUnit(cell, project, type, category);
            break;
        case 'item-col-space':
            editInlineSpace(cell, project, type, category);
            break;
        case 'item-col-name':
            editInlineDescription(cell, project, type, category);
            break;
        case 'item-col-total':
            showNotification('总计由系统自动计算，无法直接编辑', 'info');
            break;
    }
}

function editInlineCell(cell, project, type, category, field, inputType = 'text') {
    const originalValue = project[field] || 0;

    const input = document.createElement('input');
    input.type = inputType;
    input.className = 'inline-edit';
    input.value = originalValue;
    input.min = '0';
    input.step = field === 'price' ? '0.01' : '1';
    input.style.width = '100%';
    input.style.textAlign = 'center';
    input.style.padding = '8px';

    const originalHtml = cell.innerHTML;
    cell.innerHTML = '';
    cell.appendChild(input);
    input.focus();
    input.select();

    const saveChanges = () => {
        const newValue = inputType === 'number' ? parseFloat(input.value) || 0 : input.value;

        if (newValue !== originalValue) {
            project[field] = newValue;

            if (field === 'price' || field === 'quantity') {
                project.total = project.price * project.quantity;
            }

            saveDataToStorage();
            updateTableRow(project, type, category);
            updateSummary(type);

            showNotification(`${field === 'price' ? '单价' : '数量'}已更新`, 'success');
        } else {
            cell.innerHTML = originalHtml;
        }
    };

    const cancelEdit = () => {
        cell.innerHTML = originalHtml;
    };

    input.addEventListener('blur', saveChanges);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveChanges();
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    });
}

function editInlineUnit(cell, project, type, category) {
    const originalValue = project.unit || '';

    const select = document.createElement('select');
    select.className = 'inline-edit';
    select.style.width = '100%';
    select.style.padding = '4px';
    select.style.textAlign = 'center';

    const units = ['平米', '米', '项', '套', '只', '组', '樘', '个', '张', '台', '副', '幅', '延米', '根', '件', '块'];
    units.forEach(unit => {
        const option = document.createElement('option');
        option.value = unit;
        option.textContent = unit;
        if (unit === originalValue) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    const originalHtml = cell.innerHTML;
    cell.innerHTML = '';
    cell.appendChild(select);
    select.focus();

    const saveChanges = () => {
        if (select.value !== originalValue) {
            project.unit = select.value;
            saveDataToStorage();
            updateTableRow(project, type, category);
            showNotification('单位已更新', 'success');
        } else {
            cell.innerHTML = originalHtml;
        }
    };

    select.addEventListener('blur', saveChanges);
    select.addEventListener('change', saveChanges);
}

function editInlineSpace(cell, project, type, category) {
    const originalValue = project.space || '';

    const select = document.createElement('select');
    select.className = 'inline-edit';
    select.style.width = '100%';
    select.style.padding = '4px';
    select.style.textAlign = 'center';

    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = '请选择空间';
    select.appendChild(emptyOption);

    const spaces = projectData.spaces[type] || [];
    spaces.forEach(space => {
        const option = document.createElement('option');
        option.value = space;
        option.textContent = space;
        if (space === originalValue) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    const originalHtml = cell.innerHTML;
    cell.innerHTML = '';
    cell.appendChild(select);
    select.focus();

    const saveChanges = () => {
        if (select.value !== originalValue) {
            project.space = select.value;
            saveDataToStorage();
            renderProjectList(type, category);
            updateSummary(type);
            showNotification('空间已更新', 'success');
        } else {
            cell.innerHTML = originalHtml;
        }
    };

    select.addEventListener('blur', saveChanges);
    select.addEventListener('change', saveChanges);
}

function editInlineDescription(cell, project, type, category) {
    const originalHtml = cell.innerHTML;
    const originalValue = project.description || '';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-edit';
    input.value = originalValue;
    input.placeholder = '输入工艺说明...';
    input.style.width = '100%';
    input.style.padding = '8px';

    cell.innerHTML = '';
    cell.appendChild(input);
    input.focus();
    input.select();

    const saveChanges = () => {
        const newDescription = input.value.trim();

        if (newDescription !== originalValue) {
            project.description = newDescription;

            saveDataToStorage();
            updateTableRow(project, type, category);

            showNotification('工艺说明已更新', 'success');
        } else {
            cell.innerHTML = originalHtml;
        }
    };

    const cancelEdit = () => {
        cell.innerHTML = originalHtml;
    };

    input.addEventListener('blur', saveChanges);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveChanges();
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    });
}

// 项目删除
function deleteProject(type, category, id) {
    if (confirm('确定要删除这个项目吗？')) {
        projectData[type][category] = projectData[type][category].filter(item => item.id !== id);
        saveDataToStorage();
        renderProjectList(type, category);
        updateSummary(type);
        showNotification('项目已删除', 'success');
    }
}
// 替换原有的 moveItemUp 函数
function moveItemUp(type, category, itemId) {
    const items = projectData[type][category];
    if (!items || items.length === 0) return;

    const currentIndex = items.findIndex(item => item.id === itemId);
    if (currentIndex <= 0) {
        showNotification('已经是第一个项目，无法上移', 'info');
        return;
    }

    const currentItem = items[currentIndex];
    const currentSpace = (currentItem.space || '').trim();

    // 向上查找第一个与当前空间匹配的项目
    let targetIndex = -1;
    for (let i = currentIndex - 1; i >= 0; i--) {
        if ((items[i].space || '').trim() === currentSpace) {
            targetIndex = i;
            break;
        }
    }

    if (targetIndex === -1) {
        showNotification('同空间内没有可交换的上一个项目', 'info');
        return;
    }

    // 交换
    [items[currentIndex], items[targetIndex]] = [items[targetIndex], items[currentIndex]];

    saveDataToStorage();
    renderProjectList(type, category);
    updateSummary(type);
}

// 替换原有的 moveItemDown 函数
function moveItemDown(type, category, itemId) {
    const items = projectData[type][category];
    if (!items || items.length === 0) return;

    const currentIndex = items.findIndex(item => item.id === itemId);
    if (currentIndex >= items.length - 1 || currentIndex === -1) {
        showNotification('已经是最后一个项目，无法下移', 'info');
        return;
    }

    const currentItem = items[currentIndex];
    const currentSpace = (currentItem.space || '').trim();

    // 向下查找第一个与当前空间匹配的项目
    let targetIndex = -1;
    for (let i = currentIndex + 1; i < items.length; i++) {
        if ((items[i].space || '').trim() === currentSpace) {
            targetIndex = i;
            break;
        }
    }

    if (targetIndex === -1) {
        showNotification('同空间内没有可交换的下一个项目', 'info');
        return;
    }

    // 交换
    [items[currentIndex], items[targetIndex]] = [items[targetIndex], items[currentIndex]];

    saveDataToStorage();
    renderProjectList(type, category);
    updateSummary(type);
}
// 替换原有的 moveSpaceUp 函数
function moveSpaceUp(type, category, space, buttonElement) {
    const items = projectData[type][category];
    if (!items || items.length === 0) return;

    const spaces = [...new Set(items.map(item => item.space || '').filter(s => s !== ''))];

    const currentIndex = spaces.indexOf(space);
    if (currentIndex <= 0) {
        showNotification('已经是第一个空间，无法上移', 'info');
        return;
    }

    [spaces[currentIndex], spaces[currentIndex - 1]] = [spaces[currentIndex - 1], spaces[currentIndex]];

    const newItems = [];
    spaces.forEach(spaceName => {
        const spaceItems = items.filter(item => item.space === spaceName);
        newItems.push(...spaceItems);
    });

    projectData[type][category] = newItems;
    saveDataToStorage();
    renderProjectList(type, category);
    updateSummary(type);

    // 新增：强制折叠当前分类下的所有空间组
    collapseAllSpacesInCategory(type, category);
    updateCollapseButtons(); // 更新折叠按钮状态
}

// 替换原有的 moveSpaceDown 函数
function moveSpaceDown(type, category, space, buttonElement) {
    const items = projectData[type][category];
    if (!items || items.length === 0) return;

    const spaces = [...new Set(items.map(item => item.space || '').filter(s => s !== ''))];

    const currentIndex = spaces.indexOf(space);
    if (currentIndex >= spaces.length - 1 || currentIndex === -1) {
        showNotification('已经是最后一个空间，无法下移', 'info');
        return;
    }

    [spaces[currentIndex], spaces[currentIndex + 1]] = [spaces[currentIndex + 1], spaces[currentIndex]];

    const newItems = [];
    spaces.forEach(spaceName => {
        const spaceItems = items.filter(item => item.space === spaceName);
        newItems.push(...spaceItems);
    });

    projectData[type][category] = newItems;
    saveDataToStorage();
    renderProjectList(type, category);
    updateSummary(type);

    // 新增：强制折叠当前分类下的所有空间组
    collapseAllSpacesInCategory(type, category);
    updateCollapseButtons(); // 更新折叠按钮状态
}

// 空间项目管理
function moveSpaceProjects(type, category, sourceSpace, buttonElement) {
    buttonElement.style.display = 'none';

    const select = document.createElement('select');
    select.className = 'space-move-select';
    select.style.cssText = `
        border: 2px solid #f59e0b;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 13px;
        font-weight: 600;
        background: white;
        color: #d97706;
        cursor: pointer;
        outline: none;
        margin-left: 8px;
        width: 120px;
    `;

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '选择目标空间';
    select.appendChild(defaultOption);

    const separator = document.createElement('option');
    separator.disabled = true;
    separator.textContent = '──────────';
    select.appendChild(separator);

    // 从当前分类的项目中提取所有实际使用的空间（去重）
    const categories = ['base', 'auxiliary', 'furniture', 'other'];
    const usedSpacesSet = new Set();

    categories.forEach(cat => {
        const items = projectData[type][cat] || [];
        items.forEach(item => {
            if (item.space && item.space.trim() !== '') {
                usedSpacesSet.add(item.space.trim());
            }
        });
    });

    let usedSpaces = Array.from(usedSpacesSet);
    // 如果没有实际使用的空间，则回退到预定义空间库
    if (usedSpaces.length === 0) {
        usedSpaces = [...projectData.spaces[type]];
    }
    // 过滤掉当前源空间
    const spaces = usedSpaces.filter(space => space !== sourceSpace);

    if (spaces.length === 0) {
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = '无其他空间';
        emptyOption.disabled = true;
        select.appendChild(emptyOption);
    } else {
        spaces.forEach(space => {
            const option = document.createElement('option');
            option.value = space;
            option.textContent = space;
            select.appendChild(option);
        });
    }

    buttonElement.parentNode.insertBefore(select, buttonElement);

    let changeTriggered = false;

    const onClickOutside = (e) => {
        if (buttonElement && buttonElement.parentNode && buttonElement.parentNode.contains(e.target)) {
            return;
        }
        saveChange();
    };

    function saveChange() {
        if (changeTriggered) return;
        changeTriggered = true;

        const targetSpace = select.value;

        if (!targetSpace) {
            if (select && select.parentNode) {
                select.remove();
            }
            if (buttonElement) {
                buttonElement.style.display = 'inline-flex';
            }
            return;
        }

        if (confirm(`确定将"${sourceSpace}"下的所有项目转移到"${targetSpace}"吗？此操作不可撤销。`)) {
            if (!projectData.spaces[currentType].includes(targetSpace)) {
                projectData.spaces[currentType].push(targetSpace);
            }

            const sourceProjects = projectData[type][category].filter(item => item.space === sourceSpace);
            let movedCount = 0;
            let skippedCount = 0;

            const targetProjects = projectData[type][category].filter(item => item.space === targetSpace);
            const existingNames = new Set(targetProjects.map(project => project.name));

            const projectsToMove = [];
            const projectsToSkip = [];

            sourceProjects.forEach(project => {
                if (existingNames.has(project.name)) {
                    projectsToSkip.push(project);
                    skippedCount++;
                } else {
                    projectsToMove.push(project);
                }
            });

            projectsToMove.forEach(project => {
                project.space = targetSpace;
                movedCount++;
            });

            projectData[type][category] = projectData[type][category].filter(item => {
                if (item.space === sourceSpace) {
                    return projectsToSkip.some(skipProject => skipProject.id === item.id);
                }
                return true;
            });

            saveDataToStorage();
            renderProjectList(type, category);
            updateSummary(type);
            updateSpaceFilterOptions(type, category);
            loadMultiSpaceOptions();

            let message = `已转移 ${movedCount} 个项目到"${targetSpace}"`;
            if (skippedCount > 0) {
                message += `，跳过 ${skippedCount} 个重名项目（目标空间已存在同名项目）`;
            }
            showNotification(message, movedCount > 0 ? 'success' : 'warning');

            collapseAllSpacesInCategory(type, category);
        }

        if (select && select.parentNode) {
            select.remove();
        }
        if (buttonElement) {
            buttonElement.style.display = 'inline-flex';
        }

        document.removeEventListener('click', onClickOutside);
    }

    function cancelEdit() {
        if (select && select.parentNode) {
            select.remove();
        }
        if (buttonElement) {
            buttonElement.style.display = 'inline-flex';
        }

        document.removeEventListener('click', onClickOutside);
    }

    select.addEventListener('change', function () {
        saveChange();
    });

    select.addEventListener('blur', function () {
        saveChange();
    });

    select.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            saveChange();
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    });

    setTimeout(() => {
        document.addEventListener('click', onClickOutside);
        select.focus();
    }, 100);
}

function copySpaceProjects(type, category, sourceSpace, buttonElement) {
    buttonElement.style.display = 'none';

    const select = document.createElement('select');
    select.className = 'space-copy-select';
    select.style.cssText = `
        border: 2px solid #10b981;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 13px;
        font-weight: 600;
        background: white;
        color: #059669;
        cursor: pointer;
        outline: none;
        margin-left: 8px;
        width: 120px;
    `;

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '选择目标空间';
    select.appendChild(defaultOption);

    const separator = document.createElement('option');
    separator.disabled = true;
    separator.textContent = '──────────';
    select.appendChild(separator);

    // 从当前分类的项目中提取所有实际使用的空间（去重）
    const categories = ['base', 'auxiliary', 'furniture', 'other'];
    const usedSpacesSet = new Set();

    categories.forEach(cat => {
        const items = projectData[type][cat] || [];
        items.forEach(item => {
            if (item.space && item.space.trim() !== '') {
                usedSpacesSet.add(item.space.trim());
            }
        });
    });

    let usedSpaces = Array.from(usedSpacesSet);
    // 如果没有实际使用的空间，则回退到预定义空间库
    if (usedSpaces.length === 0) {
        usedSpaces = [...projectData.spaces[type]];
    }
    // 过滤掉当前源空间
    const spaces = usedSpaces.filter(space => space !== sourceSpace);

    if (spaces.length === 0) {
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = '无其他空间';
        emptyOption.disabled = true;
        select.appendChild(emptyOption);
    } else {
        spaces.forEach(space => {
            const option = document.createElement('option');
            option.value = space;
            option.textContent = space;
            select.appendChild(option);
        });
    }

    buttonElement.parentNode.insertBefore(select, buttonElement);

    let changeTriggered = false;

    const onClickOutside = (e) => {
        if (buttonElement && buttonElement.parentNode && buttonElement.parentNode.contains(e.target)) {
            return;
        }
        saveChange();
    };

    function saveChange() {
        if (changeTriggered) return;
        changeTriggered = true;

        const targetSpace = select.value;

        if (!targetSpace) {
            if (select && select.parentNode) {
                select.remove();
            }
            if (buttonElement) {
                buttonElement.style.display = 'inline-flex';
            }
            return;
        }

        if (confirm(`确定将"${sourceSpace}"下的所有项目复制到"${targetSpace}"吗？`)) {
            if (!projectData.spaces[currentType].includes(targetSpace)) {
                projectData.spaces[currentType].push(targetSpace);
            }

            const sourceProjects = projectData[type][category].filter(item => item.space === sourceSpace);
            let copiedCount = 0;
            let skippedCount = 0;

            sourceProjects.forEach(project => {
                if (isProjectDuplicate(type, category, targetSpace, project.name)) {
                    skippedCount++;
                    return;
                }

                const newProject = {
                    ...project,
                    id: generateProjectId(),
                    space: targetSpace
                };

                projectData[type][category].push(newProject);
                copiedCount++;
            });

            saveDataToStorage();
            renderProjectList(type, category);
            updateSummary(type);
            updateSpaceFilterOptions(type, category);
            loadMultiSpaceOptions();

            let message = `已复制 ${copiedCount} 个项目到"${targetSpace}"`;
            if (skippedCount > 0) {
                message += `，跳过 ${skippedCount} 个重复项目`;
            }
            showNotification(message, 'success');
            collapseAllSpacesInCategory(type, category);
        }

        if (select && select.parentNode) {
            select.remove();
        }
        if (buttonElement) {
            buttonElement.style.display = 'inline-flex';
        }

        document.removeEventListener('click', onClickOutside);
    }

    function cancelEdit() {
        if (select && select.parentNode) {
            select.remove();
        }
        if (buttonElement) {
            buttonElement.style.display = 'inline-flex';
        }

        document.removeEventListener('click', onClickOutside);
    }

    select.addEventListener('change', function () {
        saveChange();
    });

    select.addEventListener('blur', function () {
        saveChange();
    });

    select.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            saveChange();
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    });

    setTimeout(() => {
        document.addEventListener('click', onClickOutside);
        select.focus();
    }, 100);
}

function deleteSpaceProjects(type, category, space) {
    if (!confirm(`确定要删除"${space}"空间下的所有项目吗？此操作不可撤销。`)) {
        return;
    }

    const originalProjects = [...projectData[type][category]];
    projectData[type][category] = originalProjects.filter(item => item.space !== space);

    saveDataToStorage();
    renderProjectList(type, category);
    updateSummary(type);

    if (projectData[type][category].length === 0 && collapseStates[type][category]) {
        collapseStates[type][category] = false;
        toggleCategoryCollapse(type, category);
    }

    showNotification(`已删除"${space}"空间下的所有项目`, 'success');
}

function collapseAllSpacesInCategory(type, category) {
    const container = document.getElementById(`${type}-${category}-list`);
    if (!container) return;

    const spaceGroups = container.querySelectorAll('.space-group');
    spaceGroups.forEach(group => {
        const spaceContent = group.querySelector('.space-content');
        const collapseIcon = group.querySelector('.space-collapse-icon');

        if (spaceContent && collapseIcon) {
            spaceContent.classList.add('collapsed');
            collapseIcon.classList.remove('fa-chevron-down');
            collapseIcon.classList.add('fa-chevron-right');
        }
    });

    allSpacesCollapsed = true;
}

// 空间库渲染
function renderSpaceLibrary() {
    const homeSpaceList = document.getElementById('home-space-list');
    const commercialSpaceList = document.getElementById('commercial-space-list');

    if (!homeSpaceList || !commercialSpaceList) return;

    homeSpaceList.innerHTML = '';
    commercialSpaceList.innerHTML = '';

    projectData.spaces.home.forEach(space => {
        const spaceItem = document.createElement('div');
        spaceItem.className = 'space-item';
        spaceItem.dataset.space = space;
        spaceItem.innerHTML = `
            <div class="space-item-name">${space}</div>
            <div class="space-item-type">家装</div>
        `;
        spaceItem.addEventListener('click', (e) => {
            e.stopPropagation();
            selectSpaceFromLibrary(space);
        });
        homeSpaceList.appendChild(spaceItem);
    });

    projectData.spaces.commercial.forEach(space => {
        const spaceItem = document.createElement('div');
        spaceItem.className = 'space-item';
        spaceItem.dataset.space = space;
        spaceItem.innerHTML = `
            <div class="space-item-name">${space}</div>
            <div class="space-item-type">公装</div>
        `;
        spaceItem.addEventListener('click', (e) => {
            e.stopPropagation();
            selectSpaceFromLibrary(space);
        });
        commercialSpaceList.appendChild(spaceItem);
    });
}

// 删除单条记录
function deleteQuotationRecord(recordId) {
    if (confirm('确定删除这条报价记录吗？')) {
        let records = getQuotationRecords();
        records = records.filter(r => r.id !== recordId);
        saveQuotationRecords(records);
        renderQuotationRecords();
        showNotification('记录已删除', 'success');
    }
}

// 清空全部记录
function clearAllQuotationRecords() {
    if (confirm('确定要清空所有保存的报价记录吗？此操作不可撤销！')) {
        saveQuotationRecords([]);
        renderQuotationRecords();
        showNotification('已清空所有报价记录', 'success');
    }
}

// 渲染报价记录列表（展示家装/公装项目数量）
function renderQuotationRecords() {
    const container = document.getElementById('quotationRecordsList');
    if (!container) return;
    // 设置网格容器样式
    container.className = 'quotation-records-grid';
    const records = getQuotationRecords();
    if (records.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无保存的报价记录</div>';
        return;
    }
    let html = '';
    records.forEach(record => {
        const homeCount = (record.data.home?.base?.length || 0) + (record.data.home?.auxiliary?.length || 0) +
            (record.data.home?.furniture?.length || 0) + (record.data.home?.other?.length || 0);
        const commercialCount = (record.data.commercial?.base?.length || 0) + (record.data.commercial?.auxiliary?.length || 0) +
            (record.data.commercial?.furniture?.length || 0) + (record.data.commercial?.other?.length || 0);
        let displayName = record.name;
        if (displayName.length > 20) displayName = displayName.substring(0, 20) + '...';
        html += `
            <div class="record-card">
                <div class="record-header">
                    <div class="record-name" title="${escapeHtml(record.name)}">${escapeHtml(displayName)}</div>
                    <div class="record-date">${escapeHtml(record.timestamp)}</div>
                </div>
                <div class="record-stats">
                    家装: ${homeCount}项 | 公装: ${commercialCount}项
                </div>
                <div class="record-actions">
                    <button class="btn btn-sm btn-primary" onclick="loadQuotationRecord(${record.id})">
                        <i class="fas fa-folder-open"></i> 编辑
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteQuotationRecord(${record.id})">
                        <i class="fas fa-trash-alt"></i> 删除
                    </button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}
// 辅助函数：转义HTML特殊字符
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function (m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}



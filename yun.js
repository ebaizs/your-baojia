// ==================== 云端配置（统一修改点） ====================
const GIST_ID = '097f8adbb3790f3a95ba586a0867699b';          // 报价记录 Gist ID
const USER_GIST_ID = '097f8adbb3790f3a95ba586a0867699b';     // 用户账号 Gist ID
const BAOJIA_FILENAME = 'your-baojia.json';                       // 报价记录文件名
const USER_FILENAME = 'your-zhanghao.js';                      // 云端用户文件名

// 动态构建 URL
const GIST_API_URL = `https://api.github.com/gists/${GIST_ID}`;
const GIST_RAW_URL = `https://gist.githubusercontent.com/ebaizs/${GIST_ID}/raw/${BAOJIA_FILENAME}`;
const USER_GIST_RAW_URL = `https://gist.githubusercontent.com/ebaizs/${USER_GIST_ID}/raw/${USER_FILENAME}`;


// 本地存储 Key（保留，用于报价记录）
const QUOTATION_STORAGE_KEY = 'quotationRecords';

// ==================== Token 管理 ====================
function getGithubToken() {
    let token = localStorage.getItem('github_gist_token');
    if (!token) {
        token = prompt('请输入您的 Token（需 gist 权限）：请联系立诺装饰 15662061321获取');
        if (token) {
            localStorage.setItem('github_gist_token', token);
        } else {
            showNotification('未提供 Token，无法上传', 'warning');
            return null;
        }
    }
    return token;
}

function clearGithubToken() {
    localStorage.removeItem('github_gist_token');
}

// ==================== 云端上传/下载 ====================
async function uploadToCloud() {
    const records = getQuotationRecordsForExport();
    if (records.length === 0) {
        showNotification('暂无记录可上传', 'warning');
        return;
    }

    const token = getGithubToken();
    if (!token) return;

    try {
        let currentGist = null;
        try {
            const res = await fetch(GIST_API_URL);
            if (res.ok) currentGist = await res.json();
        } catch (e) {
            console.warn('获取当前 Gist 失败，将创建新 Gist', e);
        }

        const files = {};
        if (currentGist && currentGist.files) {
            for (const [filename, fileInfo] of Object.entries(currentGist.files)) {
                if (filename !== BAOJIA_FILENAME) {
    files[filename] = { content: fileInfo.content };
                }
            }
        }
        files[BAOJIA_FILENAME] = { content: JSON.stringify(records, null, 2) };

        const response = await fetch(GIST_API_URL, {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ files })
        });

        if (response.status === 401) {
            clearGithubToken();
            showNotification('Token 无效或已过期，请重新输入', 'error');
            uploadToCloud(); // 递归重试
            return;
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '上传失败');
        }

        showNotification(`成功上传 ${records.length} 条报价记录到云端`, 'success');
    } catch (error) {
        console.error('上传失败:', error);
        showNotification(`上传失败：${error.message}`, 'error');
    }
}

async function loadFromCloud() {
    showNotification('正在从云端加载报价记录...', 'info');
    try {
        const response = await fetch(GIST_RAW_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}：可能 Gist 不存在或内容为空`);
        const cloudRecords = await response.json();
        processImportedData(cloudRecords);
    } catch (error) {
        console.error('云端加载失败:', error);
        showNotification(`从云端加载失败：${error.message}`, 'error');
    }
}

// ==================== 本地导入导出 ====================
function importData() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,.txt';
    fileInput.style.display = 'none';

    fileInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const importedContent = JSON.parse(e.target.result);
                processImportedData(importedContent);
            } catch (error) {
                console.error('导入失败:', error);
                showNotification('导入失败：文件格式错误', 'error');
            }
        };
        reader.onerror = () => showNotification('读取文件失败', 'error');
        reader.readAsText(file);
    });

    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
}

function exportData() {
    const choice = confirm('请选择导出类型：\n\n确定 → 导出当前项目数据\n取消 → 导出所有报价记录');
    if (choice) {
        exportCurrentProject();
    } else {
        exportAllQuotationRecords();
    }
}

function exportCurrentProject() {
    try {
        const data = getProjectDataForExport();
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = date.getHours().toString().padStart(2, '0') + date.getMinutes().toString().padStart(2, '0');
        const projectName = projectData.projectName || '装饰项目数据';
        const fileName = `${projectName}_${dateStr}_${timeStr}.json`;
        exportToLocalFile(data, fileName);
    } catch (error) {
        console.error('导出项目数据失败:', error);
        showNotification('导出项目数据失败', 'error');
    }
}

function exportAllQuotationRecords() {
    const records = getQuotationRecordsForExport();
    if (records.length === 0) {
        showNotification('暂无报价记录可导出', 'warning');
        return;
    }
    const date = new Date();
    const fileName = `多个报价记录_${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}.json`;
    exportToLocalFile(records, fileName);
}

function exportToLocalFile(data, defaultFileName) {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = defaultFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification(`导出成功：${defaultFileName}`, 'success');
}

function getProjectDataForExport() {
    return {
        projectName: projectData.projectName,
        home: projectData.home,
        commercial: projectData.commercial,
        library: projectData.library,
        spaces: projectData.spaces,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
}

function getQuotationRecordsForExport() {
    return getQuotationRecords();  // 直接返回所有报价记录数组
}

function isProjectData(data) {
    return data && typeof data === 'object' &&
        ('home' in data || 'commercial' in data || 'spaces' in data);
}

// 云用户加载函数
async function loadCloudUsers() {
    try {
        const response = await fetch(USER_GIST_RAW_URL);
        const jsContent = await response.text();
        const users = parseUsersFromJS(jsContent);

        if (users && users.length > 0) {
            console.log('成功从云端加载用户');
            return users;
        }

        console.log('云端无用户数据，使用本地默认用户');
        return getDefaultUsers();

    } catch (error) {
        console.error('加载云端账号失败:', error);
        return getDefaultUsers();
    }
}

// 用户解析函数（保持原有逻辑，仅修复变量引用）
function parseUsersFromJS(jsContent) {
    try {
        const patterns = [
            /const\s+builtInUsers\s*=\s*(\[[\s\S]*?\]);/,
            /var\s+builtInUsers\s*=\s*(\[[\s\S]*?\]);/,
            /let\s+builtInUsers\s*=\s*(\[[\s\S]*?\]);/,
            /builtInUsers\s*=\s*(\[[\s\S]*?\];)/
        ];

        let usersArray = null;

        for (const pattern of patterns) {
            const match = jsContent.match(pattern);
            if (match) {
                try {
                    usersArray = JSON.parse(match[1].replace(/(\w+):/g, '"$1":'));
                    break;
                } catch (parseError) {
                    continue;
                }
            }
        }

        if (!usersArray) {
            try {
                const jsWithReturn = jsContent + '; return builtInUsers || [];';
                const getUsers = new Function(jsWithReturn);
                usersArray = getUsers();
            } catch (evalError) {
                console.error('eval方式也失败了:', evalError);
            }
        }

        return usersArray || [];
    } catch (error) {
        console.error('解析用户数据失败:', error);
        return [];
    }
}

// 默认用户函数
function getDefaultUsers() {
    return [
        {
            "username": "qiyu",
            "password": "8418",
            "name": "系统管理员",
            "isLocal": true,
            "isAdmin": true
        }
    ];
}

function isQuotationRecordsArray(data) {
    return Array.isArray(data) && data.every(rec =>
        rec.id && rec.name && rec.timestamp && rec.data && typeof rec.data === 'object'
    );
}

function processImportedData(data) {
    if (isProjectData(data)) {
        // 项目数据（覆盖模式）
        if (confirm('导入项目数据将覆盖当前所有项目，确定要继续吗？')) {
            mergeImportData(data);
            showNotification('项目数据导入成功！', 'success');
            return true;
        }
    } else if (isQuotationRecordsArray(data)) {
        // 报价记录数组（合并模式）
        if (confirm(`导入 ${data.length} 条报价记录，将与现有记录合并，确定要继续吗？`)) {
            mergeQuotationRecords(data);
            showNotification('报价记录导入成功！', 'success');
            return true;
        }
    } else {
        showNotification('无法识别的文件格式', 'error');
        return false;
    }
    return false;
}

// ==================== 报价记录管理（增强版） ====================
// 获取所有记录
function getQuotationRecords() {
    const records = localStorage.getItem(QUOTATION_STORAGE_KEY);
    return records ? JSON.parse(records) : [];
}

// 保存记录到本地
function saveQuotationRecords(records) {
    localStorage.setItem(QUOTATION_STORAGE_KEY, JSON.stringify(records));
}

// 加载某条记录到当前项目（编辑功能）
function loadQuotationRecord(recordId) {
    const records = getQuotationRecords();
    const record = records.find(r => r.id === recordId);
    if (!record) return;

    const choice = confirm(
        "请选择导入模式：\n\n" +
        "【确定】→ 完整导入原始数据（所有项目、单价、备注均恢复为保存时的状态）\n" +
        "【取消】→ 仅更新单价和备注（保留项目名称、空间、数量，单价/描述使用当前项目库的最新数据）"
    );

    if (choice) {
        // 模式1：完整覆盖
        if (confirm(`加载记录将覆盖当前所有项目数据，确定加载「${record.name}」吗？`)) {
            Object.assign(projectData, record.data);
            ensureProjectData();
            refreshAllViews();
            showNotification(`已完整加载报价记录：「${record.name}」`, 'success');
        }
    } else {
        // 模式2：仅更新单价和备注（价格同步）
        if (confirm(`将使用当前项目库的最新单价和工艺说明更新「${record.name}」中的项目，确定继续吗？`)) {
            // 更新全局项目名称
            if (record.data.projectName) {
                projectData.projectName = record.data.projectName;
            } else if (record.name) {
                projectData.projectName = record.name;
            }

            let updatedCount = 0;
            let notFoundCount = 0;

            ['home', 'commercial'].forEach(type => {
                ['base', 'auxiliary', 'furniture', 'other'].forEach(category => {
                    const items = record.data[type]?.[category] || [];
                    items.forEach(savedItem => {
                        const match = quickAddExamples.find(ex => ex.name === savedItem.name);
                        if (match) {
                            const existingItem = projectData[type][category].find(
                                p => p.space === savedItem.space && p.name === savedItem.name
                            );
                            if (existingItem) {
                                existingItem.price = match.price;
                                existingItem.description = match.description || '';
                                existingItem.total = existingItem.price * existingItem.quantity;
                                updatedCount++;
                            } else {
                                const newItem = {
                                    id: generateProjectId(),
                                    name: savedItem.name,
                                    space: savedItem.space,
                                    unit: match.unit || savedItem.unit,
                                    quantity: savedItem.quantity,
                                    price: match.price,
                                    total: match.price * savedItem.quantity,
                                    description: match.description || ''
                                };
                                projectData[type][category].push(newItem);
                                updatedCount++;
                            }
                        } else {
                            notFoundCount++;
                            const exists = projectData[type][category].some(
                                p => p.space === savedItem.space && p.name === savedItem.name
                            );
                            if (!exists) {
                                projectData[type][category].push({ ...savedItem, id: generateProjectId() });
                            }
                        }
                    });
                });
            });

            saveDataToStorage();
            refreshAllViews();
            let msg = `已更新 ${updatedCount} 个项目的单价和工艺说明`;
            if (notFoundCount > 0) msg += `，${notFoundCount} 个项目未在库中找到，已保留原数据`;
            showNotification(msg, 'success');
        }
    }

    function refreshAllViews() {
        ['home', 'commercial'].forEach(type => {
            ['base', 'auxiliary', 'furniture', 'other'].forEach(cat => {
                renderProjectList(type, cat);
            });
            updateSummary(type);
        });
        renderSpaceLibrary();
        initializeAllSpaceFilters();

        const nameInputs = ['projectNameInput', 'projectNameInput2'];
        nameInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = projectData.projectName || '';
        });
    }
}

// 初始化报价记录模块（绑定按钮事件）
function initQuotationModule() {
    // 保存当前报价按钮（header 和移动端）
    const headerSaveBtn = document.getElementById('headerSaveQuotationBtn');
    if (headerSaveBtn) headerSaveBtn.onclick = saveCurrentQuotation;
    const mobileSaveBtn = document.getElementById('mobileSaveQuotationBtn');
    if (mobileSaveBtn) mobileSaveBtn.onclick = saveCurrentQuotation;

    // 上传云端（现为上传到 Gist）
    const uploadBtn = document.getElementById('uploadCloudBtn');
    if (uploadBtn) uploadBtn.addEventListener('click', uploadToCloud);
    // 从云端加载（现为从 Gist 下载）
    const loadBtn = document.getElementById('loadCloudBtn');
    if (loadBtn) loadBtn.addEventListener('click', loadFromCloud);
    // 清空全部记录
    const clearAllBtn = document.getElementById('clearAllRecordsBtn');
    if (clearAllBtn) clearAllBtn.addEventListener('click', clearAllQuotationRecords);

    // 初始渲染
    renderQuotationRecords();
}

function mergeQuotationRecords(importedRecords) {
    let currentRecords = getQuotationRecords();
    const mergedMap = new Map();

    importedRecords.forEach(rec => {
        mergedMap.set(rec.id, rec);
    });
    currentRecords.forEach(rec => {
        if (!mergedMap.has(rec.id)) {
            mergedMap.set(rec.id, rec);
        }
    });

    let merged = Array.from(mergedMap.values());
    merged.sort((a, b) => b.id - a.id);
    if (merged.length > 30) merged = merged.slice(0, 30);

    saveQuotationRecords(merged);
    renderQuotationRecords();
}

function mergeImportData(importedData) {
    let addedCount = 0;
    let skippedCount = 0;

    if (importedData.projectName && importedData.projectName !== projectData.projectName) {
        projectData.projectName = importedData.projectName;
    }

    if (importedData.home) {
        ['base', 'auxiliary', 'furniture', 'other'].forEach(category => {
            if (Array.isArray(importedData.home[category])) {
                importedData.home[category].forEach(item => {
                    if (!isProjectDuplicate('home', category, item.space, item.name)) {
                        item.id = generateProjectId();
                        projectData.home[category].push(item);
                        addedCount++;
                    } else {
                        skippedCount++;
                    }
                });
            }
        });
    }

    if (importedData.commercial) {
        ['base', 'auxiliary', 'furniture', 'other'].forEach(category => {
            if (Array.isArray(importedData.commercial[category])) {
                importedData.commercial[category].forEach(item => {
                    if (!isProjectDuplicate('commercial', category, item.space, item.name)) {
                        item.id = generateProjectId();
                        projectData.commercial[category].push(item);
                        addedCount++;
                    } else {
                        skippedCount++;
                    }
                });
            }
        });
    }

    if (importedData.spaces) {
        if (Array.isArray(importedData.spaces.home)) {
            importedData.spaces.home.forEach(space => {
                if (!projectData.spaces.home.includes(space)) {
                    projectData.spaces.home.push(space);
                }
            });
        }

        if (Array.isArray(importedData.spaces.commercial)) {
            importedData.spaces.commercial.forEach(space => {
                if (!projectData.spaces.commercial.includes(space)) {
                    projectData.spaces.commercial.push(space);
                }
            });
        }
    }

    if (Array.isArray(importedData.library)) {
        importedData.library.forEach(item => {
            if (!projectData.library.includes(item)) {
                projectData.library.push(item);
            }
        });
    }

    saveDataToStorage();

    ['home', 'commercial'].forEach(type => {
        ['base', 'auxiliary', 'furniture', 'other'].forEach(category => {
            renderProjectList(type, category);
        });
        updateSummary(type);
    });

    const nameInputs = ['projectNameInput', 'projectNameInput2'];
    nameInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = projectData.projectName || '';
    });

    let message = `成功导入 ${addedCount} 个项目`;
    if (skippedCount > 0) {
        message += `，跳过 ${skippedCount} 个重复项目`;
    }
    showNotification(message, 'success');
}
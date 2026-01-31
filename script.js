// --- 1. 核心贴纸清单 ---
// 人物贴纸清单（对应 assets/characters/ 文件夹）
const characterList = [
  'c1.png',
  'c2.png',
  'c3.png',
  'c4.png'
];

// 物品贴纸清单（对应 assets/ 文件夹）
const itemList = [
  's1.png',
  's2.png',
  's3.png',
  's4.png',
  's5.png',
  's6.png',
  's7.png',
  's8.png',
  's9.png',
  's10.png',
  's11.png',
  's12.png',
  's13.png',
  's14.png',
  's15.png',
  's16.png',
  's17.png',
  's18.png',
  's19.png'
];

// --- 2. 页面切换控制 ---
function showLayer(layerId) {
    console.log("切换到页面:", layerId);
    const layers = ['layer-splash', 'menu-page', 'layer-identity', 'layer-journal'];
    layers.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            el.classList.remove('flex');
            if (id === layerId) {
                el.classList.remove('hidden');
                el.classList.add('flex');
            }
        }
    });
}

// 华丽转场逻辑
function executeOtomeTransition(targetLayerId) {
    const overlay = document.getElementById('transition-overlay');
    if (!overlay) return showLayer(targetLayerId);

    // 激活遮罩
    overlay.style.setProperty('display', 'flex', 'important');
    overlay.style.pointerEvents = 'auto';
    setTimeout(() => overlay.style.opacity = '1', 50);

    // 粒子喷发
    const container = overlay.querySelector('.particles-container');
    if (container) {
        container.innerHTML = '';
        for (let i = 0; i < 40; i++) {
            const p = document.createElement('div');
            p.className = 'stardust-particle';
            p.style.left = '50%'; p.style.top = '50%';
            p.style.setProperty('--tx', `${(Math.random() - 0.5) * 600}px`);
            p.style.setProperty('--ty', `${(Math.random() - 0.5) * 800}px`);
            container.appendChild(p);
        }
    }

    // 核心跳转
    setTimeout(() => {
        showLayer(targetLayerId);
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
            overlay.style.pointerEvents = 'none';
        }, 600);
    }, 900);
}

// --- 3. 贴纸交互功能 ---
// 管理贴纸选中状态
function selectSticker(sticker) {
    // 移除所有贴纸的选中状态
    document.querySelectorAll('.sticker-wrapper').forEach(s => {
        s.classList.remove('selected');
    });
    // 添加当前贴纸的选中状态
    sticker.classList.add('selected');
}

function addStickerToCanvas(src) {
    const layer = document.getElementById('journal-sticker-layer');
    if (!layer) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'sticker-wrapper';
    wrapper.style.setProperty('--s', '0.5');
    wrapper.style.setProperty('--r', '0deg');
    wrapper.style.setProperty('--x', '0px');
    wrapper.style.setProperty('--y', '0px');
    wrapper.style.setProperty('--f', '1');

    // 创建贴纸图片
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'sticker';
    img.className = 'sticker-img';
    img.draggable = false;

    // 创建删除按钮
    const deleteBtn = document.createElement('div');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '×';

    // 创建翻转按钮
    const flipBtn = document.createElement('div');
    flipBtn.className = 'flip-btn';
    flipBtn.textContent = '↔';

    // 创建缩放旋转手柄
    const scaleHandle = document.createElement('div');
    scaleHandle.className = 'scale-handle';
    scaleHandle.textContent = '✥';

    // 添加到容器
    wrapper.appendChild(img);
    wrapper.appendChild(deleteBtn);
    wrapper.appendChild(flipBtn);
    wrapper.appendChild(scaleHandle);

    // 绑定删除和翻转
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        wrapper.remove();
    };
    let flipped = 1;
    flipBtn.onclick = (e) => {
        e.stopPropagation();
        flipped *= -1;
        wrapper.style.setProperty('--f', flipped);
    };

    // 为贴纸图片添加点击事件，确保点击图片也能选中贴纸
    img.onclick = (e) => {
        e.stopPropagation();
        selectSticker(wrapper);
    };

    // 为贴纸容器添加点击事件，确保点击容器也能选中贴纸
    wrapper.onclick = (e) => {
        if (e.target === img) return;
        selectSticker(wrapper);
    };

    layer.appendChild(wrapper);
    initStickerInteract(wrapper);
    // 自动选中新添加的贴纸
    selectSticker(wrapper);
}

// 为贴纸库添加点击事件，点击空白处取消选中状态
document.addEventListener('DOMContentLoaded', () => {
    // 点击手账画布空白处取消选中状态
    const journalCanvas = document.getElementById('journal-canvas');
    if (journalCanvas) {
        journalCanvas.addEventListener('click', () => {
            document.querySelectorAll('.sticker-wrapper').forEach(s => {
                s.classList.remove('selected');
            });
        });
    }
});

function initStickerInteract(el) {
    let x = 0, y = 0, s = 0.5, r = 0;
    let isDragging = false;
    let isScaling = false;
    let startX, startY, startScale, startRotation;

    // 拖拽功能 - 使用原生鼠标事件
    el.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('scale-handle') || e.target.classList.contains('delete-btn') || e.target.classList.contains('flip-btn')) return;
        
        // 记录初始位置和时间
        let mouseDownTime = Date.now();
        let initialX = e.clientX;
        let initialY = e.clientY;
        
        const mouseUpHandler = (event) => {
            let mouseUpTime = Date.now();
            let currentX = event.clientX;
            let currentY = event.clientY;
            let distance = Math.sqrt(Math.pow(currentX - initialX, 2) + Math.pow(currentY - initialY, 2));
            
            if (mouseUpTime - mouseDownTime < 200 && distance < 5) {
                // 是点击事件，不是拖拽
                selectSticker(el);
            }
            document.removeEventListener('mouseup', mouseUpHandler);
            document.removeEventListener('mousemove', mouseMoveHandler);
        };
        
        const mouseMoveHandler = () => {
            document.removeEventListener('mouseup', mouseUpHandler);
            document.removeEventListener('mousemove', mouseMoveHandler);
        };
        
        document.addEventListener('mouseup', mouseUpHandler);
        document.addEventListener('mousemove', mouseMoveHandler);
        
        isDragging = true;
        startX = e.clientX - x;
        startY = e.clientY - y;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            x = e.clientX - startX;
            y = e.clientY - startY;
            el.style.setProperty('--x', `${x}px`);
            el.style.setProperty('--y', `${y}px`);
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        isScaling = false;
    });

    // 缩放旋转功能 - 使用原生鼠标事件
    const handle = el.querySelector('.scale-handle');
    handle.addEventListener('mousedown', (e) => {
        isScaling = true;
        startX = e.clientX;
        startY = e.clientY;
        startScale = s;
        startRotation = r;
    });

    document.addEventListener('mousemove', (e) => {
        if (isScaling) {
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // 计算距离和角度
            const dist = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));
            s = Math.max(Math.min(dist / 150, 2), 0.1); // 调整敏感度和范围
            const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
            r = angle * (180 / Math.PI);
            
            // 更新CSS变量
            el.style.setProperty('--s', s);
            el.style.setProperty('--r', `${r}deg`);
        }
    });
}

// --- 4. 初始化 ---
function renderStickers(category) {
    const lib = document.getElementById('journal-sticker-library');
    if (!lib) return;
    lib.innerHTML = '';
    
    // 根据分类选择对应的贴纸列表
    const stickerList = category === 'characters' ? characterList : itemList;
    
    stickerList.forEach(file => {
        const item = document.createElement('div');
        item.className = 'sticker-preview bg-slate-800 rounded-lg p-1 border border-slate-700 overflow-hidden cursor-pointer';
        
        // 智能路径逻辑
        let path;
        if (file.startsWith('c')) {
            // 人物贴纸（c开头）的路径固定为：assets/characters/文件名
            path = `assets/characters/${file}`;
        } else if (file.startsWith('s')) {
            // 物品贴纸（s开头）的路径固定为：assets/文件名
            path = `assets/${file}`;
        } else {
            // 默认路径
            path = `assets/${file}`;
        }
        
        item.innerHTML = `<img src="${path}" class="w-full h-full object-contain">`;
        item.onclick = () => {
            console.log('Adding sticker:', path);
            addStickerToCanvas(path);
        };
        lib.appendChild(item);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // 强制初始化遮罩状态，防止挡路
    const ov = document.getElementById('transition-overlay');
    if(ov) { ov.style.display = 'none'; ov.style.pointerEvents = 'none'; }

    // 首页按钮
    document.getElementById('btn-splash-enter')?.addEventListener('click', () => showLayer('menu-page'));
    
    // 菜单按钮
    document.getElementById('btn-journal')?.addEventListener('click', () => {
        executeOtomeTransition('layer-journal');
        renderStickers('characters');
    });

    document.getElementById('btn-card')?.addEventListener('click', () => executeOtomeTransition('layer-identity'));
    // 返回菜单按钮
    document.getElementById('btn-back-to-menu')?.addEventListener('click', () => showLayer('menu-page'));
    document.getElementById('btn-back-to-menu-journal')?.addEventListener('click', () => showLayer('menu-page'));

    // 分类按钮
    document.querySelectorAll('.journal-category-btn').forEach(btn => {
        btn.onclick = () => {
            const cat = btn.dataset.category;
            renderStickers(cat);
        };
    });

    // 保存手账按钮
    document.getElementById('save-journal')?.addEventListener('click', () => {
        const canvas = document.getElementById('journal-canvas');
        if (!canvas) return;

        // 使用html2canvas保存手账
        html2canvas(canvas, {
            scale: 2, // 提高清晰度
            useCORS: true, // 允许加载跨域图片
            logging: false, // 禁用日志
            backgroundColor: null // 保持透明背景
        }).then((canvas) => {
            // 创建下载链接
            const link = document.createElement('a');
            link.download = 'journal-' + new Date().getTime() + '.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch((error) => {
            console.error('保存手账失败:', error);
        });
    });

    // 卡面背景预览选择功能
    // 只添加实际存在的图片文件
    const backgroundList = [
        'images/card_01.png',
        'images/card_03.jpg',
        'images/card_04.jpg',
        'images/card_05.jpg',
        'images/card_06.jpg',
        'images/card_07.jpg',
        'images/card-bg.jpg'
    ];

    const backgroundLibrary = document.getElementById('background-library');
    const cardBackground = document.getElementById('card-background');

    if (backgroundLibrary && cardBackground) {
        // 生成背景图预览
        backgroundList.forEach((bgPath, index) => {
            const item = document.createElement('div');
            item.className = 'bg-preview flex-shrink-0 w-16 h-24 rounded-xl overflow-hidden border-2 border-transparent cursor-pointer transition-all hover:scale-105';
            
            // 第一个背景图默认为选中状态
            if (index === 0) {
                item.classList.add('border-fuchsia-500/80');
            }
            
            item.innerHTML = `<div class="w-full h-full bg-cover bg-center" style="background-image: url('${bgPath}');"></div>`;
            
            // 添加点击事件
            item.addEventListener('click', () => {
                // 更新背景图
                cardBackground.style.backgroundImage = `url('${bgPath}')`;
                
                // 更新选中状态
                document.querySelectorAll('.bg-preview').forEach(el => {
                    el.classList.remove('border-fuchsia-500/80');
                });
                item.classList.add('border-fuchsia-500/80');
            });
            
            backgroundLibrary.appendChild(item);
        });
    }

    // 暗号解锁功能
    const secretCodeInput = document.getElementById('secret-code');
    const unlockButton = document.getElementById('unlock-button');
    const unlockMessage = document.getElementById('unlock-message');
    const stickerLibrary = document.getElementById('sticker-library');

    // 检查localStorage中是否已有解锁状态
    const isUnlocked = localStorage.getItem('isUnlocked') === 'true';
    if (isUnlocked) {
        // 如果已经解锁，显示贴纸库
        stickerLibrary.style.display = 'flex';
        unlockMessage.classList.remove('hidden');
        unlockMessage.classList.add('flex', 'items-center', 'justify-center');
    } else {
        // 如果未解锁，隐藏贴纸库
        stickerLibrary.style.display = 'none';
    }

    // 解锁按钮点击事件
    if (unlockButton) {
        unlockButton.addEventListener('click', () => {
            const code = secretCodeInput.value.trim().toUpperCase();
            
            // 验证暗号
            if (code === 'LOVE888') {
                // 显示金光闪过特效
                const flashEffect = document.createElement('div');
                flashEffect.className = 'gold-flash-effect';
                unlockButton.parentElement.parentElement.parentElement.appendChild(flashEffect);
                
                // 显示解锁消息
                setTimeout(() => {
                    unlockMessage.classList.remove('hidden');
                    unlockMessage.classList.add('flex', 'items-center', 'justify-center');
                    
                    // 显示贴纸库
                    stickerLibrary.style.display = 'flex';
                    
                    // 保存解锁状态到localStorage
                    localStorage.setItem('isUnlocked', 'true');
                    
                    // 移除闪光效果
                    setTimeout(() => {
                        flashEffect.remove();
                    }, 1000);
                }, 500);
            } else {
                // 显示错误消息
                unlockMessage.textContent = '暗号错误，请重试...';
                unlockMessage.classList.remove('hidden', 'text-yellow-200');
                unlockMessage.classList.add('flex', 'items-center', 'justify-center', 'text-red-300');
                
                // 3秒后隐藏错误消息
                setTimeout(() => {
                    unlockMessage.classList.add('hidden');
                    unlockMessage.classList.remove('flex', 'items-center', 'justify-center', 'text-red-300');
                }, 3000);
            }
        });
    }

    // 输入框回车事件
    if (secretCodeInput) {
        secretCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                unlockButton.click();
            }
        });
    }
});
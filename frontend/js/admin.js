let adminCategoriesCache = [];
let editingServiceId = null;
let editingCategoryId = null;

function switchAdminTab(tab) {
    const servicesTab = document.getElementById('adminServices');
    const categoriesTab = document.getElementById('adminCategories');
    const tabs = document.querySelectorAll('.admin-tabs .tab-btn');
    
    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'services') {
        servicesTab.style.display = 'block';
        categoriesTab.style.display = 'none';
        tabs[0].classList.add('active');
    } else {
        servicesTab.style.display = 'none';
        categoriesTab.style.display = 'block';
        tabs[1].classList.add('active');
        loadCategoriesAdmin();
    }
}

async function loadAdmin() {
    if (!currentUser || currentUser.role !== 'admin') {
        return;
    }
    
    loadServicesAdmin();
}

async function loadServicesAdmin() {
    try {
        const [services, categories] = await Promise.all([
            getServicesAPI(),
            getCategoriesAPI()
        ]);
        adminCategoriesCache = categories;
        const container = document.getElementById('adminServicesList');
        container.innerHTML = services.map(service => {
            const category = categories.find(c => c.id === service.categoryId);
            const priceLabel = service.price != null ? `€${Number(service.price).toFixed(2)}` : '—';
            return `
                <div class="admin-item" data-service-id="${service.id}">
                    <div>
                        <h4>${service.name}</h4>
                        <p>Категория: ${category ? category.name : 'Няма'}</p>
                        <p>Продължителност: ${service.durationMinutes} минути</p>
                        <p>Цена: ${priceLabel}</p>
                    </div>
                    <div>
                        <button class="btn-primary" onclick="editService(${service.id})">Редакция</button>
                        <button class="btn-secondary" onclick="deleteService(${service.id})">Изтрий</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

async function loadCategoriesAdmin() {
    try {
        const categories = await getCategoriesAPI();
        const container = document.getElementById('adminCategoriesList');
        container.innerHTML = categories.map(category => `
            <div class="admin-item" data-category-id="${category.id}">
                <div>
                    <h4>${category.name}</h4>
                    <p>${category.description || ''}</p>
                </div>
                <div>
                    <button class="btn-primary" onclick="editCategory(${category.id})">Редакция</button>
                    <button class="btn-secondary" onclick="deleteCategory(${category.id})">Изтрий</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function ensureAdminCategories() {
    if (adminCategoriesCache.length > 0) {
        return adminCategoriesCache;
    }
    adminCategoriesCache = await getCategoriesAPI();
    return adminCategoriesCache;
}

function renderServiceCategoriesOptions(categories, selectedId) {
    const categoryInput = document.getElementById('serviceCategoryInput');
    const activeId = selectedId || (categories[0] ? categories[0].id : null);
    categoryInput.innerHTML = categories.map(category => {
        const selected = activeId === category.id ? 'selected' : '';
        return `<option value="${category.id}" ${selected}>${category.name}</option>`;
    }).join('');
}

function openServiceEditor(service) {
    const editor = document.getElementById('serviceEditor');
    const title = document.getElementById('serviceEditorTitle');
    const subtitle = document.getElementById('serviceEditorSubtitle');
    const error = document.getElementById('serviceEditorError');
    const nameInput = document.getElementById('serviceNameInput');
    const categoryInput = document.getElementById('serviceCategoryInput');
    const durationInput = document.getElementById('serviceDurationInput');
    const priceInput = document.getElementById('servicePriceInput');
    const descriptionInput = document.getElementById('serviceDescriptionInput');

    error.textContent = '';
    editor.style.display = 'block';

    if (service) {
        editingServiceId = service.id;
        title.textContent = 'Редакция на услуга';
        subtitle.textContent = `Редактирате ${service.name}`;
        nameInput.value = service.name || '';
        durationInput.value = service.durationMinutes || '';
        priceInput.value = service.price != null ? Number(service.price).toFixed(2) : '';
        descriptionInput.value = service.description || '';
        categoryInput.value = service.categoryId || '';
    } else {
        editingServiceId = null;
        title.textContent = 'Добавяне на услуга';
        subtitle.textContent = 'Попълнете всички полета, за да създадете нова услуга.';
        nameInput.value = '';
        durationInput.value = '';
        priceInput.value = '';
        descriptionInput.value = '';
        categoryInput.value = '';
    }
}

function closeServiceEditor() {
    const editor = document.getElementById('serviceEditor');
    const error = document.getElementById('serviceEditorError');
    editor.style.display = 'none';
    error.textContent = '';
    editingServiceId = null;
}

function placeEditorDefault() {
    const adminServices = document.getElementById('adminServices');
    const editor = document.getElementById('serviceEditor');
    if (adminServices && editor && editor.parentElement !== adminServices) {
        adminServices.insertBefore(editor, adminServices.querySelector('#adminServicesList'));
    }
}

function showAddServiceForm() {
    ensureAdminCategories()
        .then(categories => {
            placeEditorDefault();
            renderServiceCategoriesOptions(categories, categories[0]?.id || '');
            openServiceEditor(null);
        })
        .catch(err => alert(err.message));
}

function showAddCategoryForm() {
    placeCategoryEditorDefault();
    openCategoryEditor(null);
}

async function editService(id) {
    try {
        const service = await getServiceAPI(id);
        const categories = await ensureAdminCategories();
        const editor = document.getElementById('serviceEditor');
        const serviceRow = document.querySelector(`[data-service-id="${id}"]`);
        if (editor && serviceRow) {
            serviceRow.insertAdjacentElement('afterend', editor);
        }
        renderServiceCategoriesOptions(categories, service.categoryId);
        openServiceEditor(service);
    } catch (error) {
        alert(error.message || 'Грешка при обновяване на услугата');
    }
}

async function saveService() {
    const error = document.getElementById('serviceEditorError');
    const nameInput = document.getElementById('serviceNameInput');
    const categoryInput = document.getElementById('serviceCategoryInput');
    const durationInput = document.getElementById('serviceDurationInput');
    const priceInput = document.getElementById('servicePriceInput');
    const descriptionInput = document.getElementById('serviceDescriptionInput');

    const name = nameInput.value.trim();
    const categoryId = parseInt(categoryInput.value, 10);
    const durationMinutes = parseInt(durationInput.value, 10);
    const rawPrice = priceInput.value.trim();
    const price = rawPrice ? Number(rawPrice.replace(',', '.')) : null;
    const description = descriptionInput.value.trim();

    if (!name || Number.isNaN(categoryId) || Number.isNaN(durationMinutes)) {
        error.textContent = 'Моля, попълнете име, категория и продължителност.';
        return;
    }

    if (rawPrice && Number.isNaN(price)) {
        error.textContent = 'Моля, въведете валидна цена (например 25.00).';
        return;
    }

    try {
        if (editingServiceId) {
            await updateServiceAPI(editingServiceId, {
                name,
                categoryId,
                description,
                durationMinutes,
                price
            });
        } else {
            await createServiceAPI({
                name,
                categoryId,
                description,
                durationMinutes,
                price
            });
        }
        closeServiceEditor();
        loadServicesAdmin();
    } catch (err) {
        error.textContent = err.message || 'Грешка при записване на услугата.';
    }
}

function cancelServiceEdit() {
    placeEditorDefault();
    closeServiceEditor();
}

async function deleteService(id) {
    if (!confirm('Сигурни ли сте, че искате да изтриете тази услуга?')) {
        return;
    }
    
    try {
        await deleteServiceAPI(id);
        const serviceRow = document.querySelector(`[data-service-id="${id}"]`);
        if (serviceRow) {
            serviceRow.remove();
        }
        alert('Услугата е изтрита');
    } catch (error) {
        alert(error.message || 'Грешка при изтриване на услугата');
    }
}

async function editCategory(id) {
    try {
        const categories = await getCategoriesAPI();
        const category = categories.find(c => c.id === id);
        const editor = document.getElementById('categoryEditor');
        const categoryRow = document.querySelector(`[data-category-id="${id}"]`);
        if (editor && categoryRow) {
            categoryRow.insertAdjacentElement('afterend', editor);
        }
        openCategoryEditor(category);
    } catch (error) {
        alert(error.message || 'Грешка при обновяване на категорията');
    }
}

async function deleteCategory(id) {
    if (!confirm('Сигурни ли сте, че искате да изтриете тази категория?')) {
        return;
    }
    
    try {
        await deleteCategoryAPI(id);
        loadCategoriesAdmin();
        alert('Категорията е изтрита');
    } catch (error) {
        alert(error.message || 'Грешка при изтриване на категорията');
    }
}

function openCategoryEditor(category) {
    const editor = document.getElementById('categoryEditor');
    const title = document.getElementById('categoryEditorTitle');
    const subtitle = document.getElementById('categoryEditorSubtitle');
    const error = document.getElementById('categoryEditorError');
    const nameInput = document.getElementById('categoryNameInput');
    const descriptionInput = document.getElementById('categoryDescriptionInput');

    error.textContent = '';
    editor.style.display = 'block';

    if (category) {
        editingCategoryId = category.id;
        title.textContent = 'Редакция на категория';
        subtitle.textContent = `Редактирате ${category.name}`;
        nameInput.value = category.name || '';
        descriptionInput.value = category.description || '';
    } else {
        editingCategoryId = null;
        title.textContent = 'Добавяне на категория';
        subtitle.textContent = 'Попълнете всички полета, за да създадете нова категория.';
        nameInput.value = '';
        descriptionInput.value = '';
    }
}

function closeCategoryEditor() {
    const editor = document.getElementById('categoryEditor');
    const error = document.getElementById('categoryEditorError');
    editor.style.display = 'none';
    error.textContent = '';
    editingCategoryId = null;
}

function placeCategoryEditorDefault() {
    const adminCategories = document.getElementById('adminCategories');
    const editor = document.getElementById('categoryEditor');
    if (adminCategories && editor && editor.parentElement !== adminCategories) {
        adminCategories.insertBefore(editor, adminCategories.querySelector('#adminCategoriesList'));
    }
}

async function saveCategory() {
    const error = document.getElementById('categoryEditorError');
    const nameInput = document.getElementById('categoryNameInput');
    const descriptionInput = document.getElementById('categoryDescriptionInput');

    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!name) {
        error.textContent = 'Моля, въведете име на категория.';
        return;
    }

    try {
        if (editingCategoryId) {
            await updateCategoryAPI(editingCategoryId, {
                name,
                description
            });
        } else {
            await createCategoryAPI({
                name,
                description
            });
        }
        closeCategoryEditor();
        loadCategoriesAdmin();
    } catch (err) {
        error.textContent = err.message || 'Грешка при записване на категорията.';
    }
}

function cancelCategoryEdit() {
    placeCategoryEditorDefault();
    closeCategoryEditor();
}

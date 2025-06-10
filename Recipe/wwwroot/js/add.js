let ingredients = [];
        let steps = [];

        // Character counters
        document.getElementById('recipeName').addEventListener('input', function() {
            updateCharCounter('nameCounter', this.value, 200);
        });

        document.getElementById('description').addEventListener('input', function() {
            updateCharCounter('descCounter', this.value, 500);
        });

        function updateCharCounter(counterId, value, max) {
            const counter = document.getElementById(counterId);
            const count = value.length;
            counter.textContent = `${count}/${max}`;
            
            if (count > max * 0.9) {
                counter.className = 'char-counter danger';
            } else if (count > max * 0.7) {
                counter.className = 'char-counter warning';
            } else {
                counter.className = 'char-counter';
            }
        }

        // Add ingredient function
        function addIngredient() {
            const input = document.getElementById('ingredientInput');
            const value = input.value.trim();
            
            if (value === '') {
                showAlert('Lütfen bir malzeme girin!', 'danger');
                input.focus();
                return;
            }
            
            if (ingredients.includes(value)) {
                showAlert('Bu malzeme zaten ekli!', 'warning');
                return;
            }
            
            ingredients.push(value);
            input.value = '';
            updateIngredientsList();
            updateHiddenField('ingredientsHidden', ingredients);
        }

        // Add step function
        function addStep() {
            const input = document.getElementById('stepInput');
            const value = input.value.trim();
            
            if (value === '') {
                showAlert('Lütfen bir adım girin!', 'danger');
                input.focus();
                return;
            }
            
            steps.push(value);
            input.value = '';
            updateStepsList();
            updateHiddenField('instructionsHidden', steps);
        }

        // Update ingredients list
        function updateIngredientsList() {
            const container = document.getElementById('ingredientsList');
            
            if (ingredients.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-clipboard-list fa-2x mb-2 d-block"></i>
                        Henüz malzeme eklenmedi
                    </div>
                `;
                return;
            }
            
            container.innerHTML = ingredients.map((ingredient, index) => `
                <div class="dynamic-item">
                    <div class="dynamic-item-content">• ${ingredient}</div>
                    <button type="button" class="btn-remove" onclick="removeIngredient(${index})" title="Sil">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');
        }

        // Update steps list
        function updateStepsList() {
            const container = document.getElementById('stepsList');
            
            if (steps.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-list-ol fa-2x mb-2 d-block"></i>
                        Henüz adım eklenmedi
                    </div>
                `;
                return;
            }
            
            container.innerHTML = steps.map((step, index) => `
                <div class="dynamic-item">
                    <div class="dynamic-item-content">
                        <span class="step-number">${index + 1}</span>
                        ${step}
                    </div>
                    <button type="button" class="btn-remove" onclick="removeStep(${index})" title="Sil">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');
        }

        // Remove functions
        function removeIngredient(index) {
            ingredients.splice(index, 1);
            updateIngredientsList();
            updateHiddenField('ingredientsHidden', ingredients);
        }

        function removeStep(index) {
            steps.splice(index, 1);
            updateStepsList();
            updateHiddenField('instructionsHidden', steps);
        }

        // Update hidden fields
        function updateHiddenField(fieldId, array) {
            document.getElementById(fieldId).value = JSON.stringify(array);
        }

        // Image handling
        document.getElementById('imageFile').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('imagePreview');
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });

        // Drag and drop for image
        const uploadArea = document.querySelector('.image-upload-area');
        
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                document.getElementById('imageFile').files = files;
                document.getElementById('imageFile').dispatchEvent(new Event('change'));
            }
        });

        // Preview function
        function previewRecipe() {
            const formData = new FormData(document.getElementById('recipeForm'));
            const data = Object.fromEntries(formData);
            
            if (!data.Name || !data.Category || !data.Level) {
                showAlert('Önizleme için en az Tarif Adı, Kategori ve Zorluk Seviyesi gereklidir!', 'warning');
                return;
            }
            
            const previewContent = `
                <div class="recipe-preview">
                    <div class="row">
                        <div class="col-md-8">
                            <h3>${data.Name}</h3>
                            <div class="mb-3">
                                <span class="badge bg-primary me-2">${data.Category}</span>
                                <span class="badge bg-success me-2">${data.Level}</span>
                                ${data.PrepTime ? `<span class="badge bg-info me-2">${data.PrepTime} dk</span>` : ''}
                                ${data.Servings ? `<span class="badge bg-warning">${data.Servings} kişilik</span>` : ''}
                            </div>
                            ${data.Description ? `<p class="text-muted">${data.Description}</p>` : ''}
                        </div>
                        <div class="col-md-4">
                            ${data.ImageUrl ? `<img src="${data.ImageUrl}" class="img-fluid rounded" alt="Recipe Image">` : 
                              '<div class="bg-light rounded p-4 text-center text-muted">Görsel Yok</div>'}
                        </div>
                    </div>
                    
                    ${ingredients.length > 0 ? `
                        <h5 class="mt-4">Malzemeler</h5>
                        <ul class="list-group list-group-flush">
                            ${ingredients.map(ing => `<li class="list-group-item">• ${ing}</li>`).join('')}
                        </ul>
                    ` : ''}
                    
                    ${steps.length > 0 ? `
                        <h5 class="mt-4">Yapılışı</h5>
                        <ol class="list-group list-group-numbered">
                            ${steps.map(step => `<li class="list-group-item">${step}</li>`).join('')}
                        </ol>
                    ` : ''}
                </div>
            `;
            
            document.getElementById('previewContent').innerHTML = previewContent;
            new bootstrap.Modal(document.getElementById('previewModal')).show();
        }

        // Form submission
        document.getElementById('recipeForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate form
            if (!this.checkValidity()) {
                e.stopPropagation();
                this.classList.add('was-validated');
                showAlert('Lütfen gerekli alanları doldurun!', 'danger');
                return;
            }
            
            // Check if ingredients and steps are added
            if (ingredients.length === 0) {
                showAlert('En az bir malzeme eklemelisiniz!', 'warning');
                document.getElementById('ingredientInput').focus();
                return;
            }
            
            if (steps.length === 0) {
                showAlert('En az bir yapılış adımı eklemelisiniz!', 'warning');
                document.getElementById('stepInput').focus();
                return;
            }
            
            // Update hidden fields
            updateHiddenField('ingredientsHidden', ingredients);
            updateHiddenField('instructionsHidden', steps);
            
            // Show loading
            const submitBtn = document.getElementById('submitBtn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<div class="loading-spinner me-2"></div>Kaydediliyor...';
            submitBtn.disabled = true;
            
            try {
                // Simulate API call - replace with actual implementation
                const formData = new FormData(this);
                
                // Convert JSON strings back for server
                formData.set('Ingredients', ingredients.join('\n'));
                formData.set('Instructions', steps.join('\n'));
                
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Here you would make the actual API call:
                /*
                const response = await fetch('/Admin/Recipe/Create', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    showAlert('Tarif başarıyla kaydedildi! 🎉', 'success');
                    resetForm();
                } else {
                    const error = await response.text();
                    showAlert(`Hata: ${error}`, 'danger');
                }
                */
                
                // For demo purposes:
                showAlert('Tarif başarıyla kaydedildi! 🎉', 'success');
                setTimeout(() => {
                    // Redirect to recipes list or reset form
                    // window.location.href = '/Admin/Recipes';
                    resetForm();
                }, 2000);
                
            } catch (error) {
                console.error('Error:', error);
                showAlert('Bir hata oluştu: ' + error.message, 'danger');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });

        // Reset form function
        function resetForm() {
            if (confirm('Formu temizlemek istediğinizden emin misiniz? Tüm veriler silinecektir.')) {
                document.getElementById('recipeForm').reset();
                document.getElementById('recipeForm').classList.remove('was-validated');
                
                // Reset arrays
                ingredients = [];
                steps = [];
                
                // Update lists
                updateIngredientsList();
                updateStepsList();
                
                // Hide image preview
                document.getElementById('imagePreview').style.display = 'none';
                
                // Reset character counters
                updateCharCounter('nameCounter', '', 200);
                updateCharCounter('descCounter', '', 500);
                
                // Clear hidden fields
                document.getElementById('ingredientsHidden').value = '';
                document.getElementById('instructionsHidden').value = '';
                
                showAlert('Form temizlendi!', 'success');
            }
        }

        // Show alert function
        function showAlert(message, type = 'info') {
            const alertContainer = document.getElementById('alertContainer');
            const alertClass = type === 'success' ? 'alert-success' : 
                             type === 'warning' ? 'alert-warning' : 
                             type === 'danger' ? 'alert-danger' : 'alert-info';
            
            const alert = document.createElement('div');
            alert.className = `alert ${alertClass} alert-dismissible fade show`;
            alert.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            
            // Remove existing alerts
            alertContainer.innerHTML = '';
            alertContainer.appendChild(alert);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 5000);
            
            // Scroll to top to show alert
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Enter key support for adding ingredients and steps
        document.getElementById('ingredientInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addIngredient();
            }
        });

        document.getElementById('stepInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                addStep();
            }
        });

        // Auto-save functionality (optional)
        let autoSaveTimer;
        function autoSave() {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => {
                const formData = new FormData(document.getElementById('recipeForm'));
                const data = Object.fromEntries(formData);
                
                // Save to localStorage as backup
                const autoSaveData = {
                    ...data,
                    ingredients: ingredients,
                    steps: steps,
                    timestamp: new Date().getTime()
                };
                
                localStorage.setItem('recipeAutoSave', JSON.stringify(autoSaveData));
                console.log('Auto-saved at', new Date().toLocaleTimeString());
            }, 3000);
        }

        // Load auto-saved data on page load
        function loadAutoSave() {
            const autoSaveData = localStorage.getItem('recipeAutoSave');
            if (autoSaveData) {
                const data = JSON.parse(autoSaveData);
                const timeDiff = new Date().getTime() - data.timestamp;
                
                // If auto-save is less than 1 hour old, offer to restore
                if (timeDiff < 3600000) {
                    if (confirm('Kaydedilmemiş bir form bulundu. Geri yüklemek ister misiniz?')) {
                        // Restore form data
                        Object.keys(data).forEach(key => {
                            if (key !== 'ingredients' && key !== 'steps' && key !== 'timestamp') {
                                const field = document.querySelector(`[name="${key}"]`);
                                if (field) field.value = data[key];
                            }
                        });
                        
                        // Restore ingredients and steps
                        if (data.ingredients) {
                            ingredients = data.ingredients;
                            updateIngredientsList();
                        }
                        
                        if (data.steps) {
                            steps = data.steps;
                            updateStepsList();
                        }
                        
                        showAlert('Kaydedilmemiş veriler geri yüklendi!', 'info');
                    }
                }
            }
        }

        // Add auto-save listeners to form fields
        function initAutoSave() {
            const formFields = document.querySelectorAll('#recipeForm input, #recipeForm select, #recipeForm textarea');
            formFields.forEach(field => {
                field.addEventListener('input', autoSave);
                field.addEventListener('change', autoSave);
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Ctrl+S: Save form
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                document.getElementById('submitBtn').click();
            }
            
            // Ctrl+R: Reset form
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                resetForm();
            }
            
            // Ctrl+P: Preview
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                previewRecipe();
            }
        });

        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            // Load auto-saved data
            loadAutoSave();
            
            // Initialize auto-save
            initAutoSave();
            
            // Initialize tooltips
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[title]'));
            tooltipTriggerList.map(function(tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
            
            // Focus on first input
            document.getElementById('recipeName').focus();
            
            console.log('Admin recipe form initialized');
        });

        // Clean up auto-save on successful submit
        function clearAutoSave() {
            localStorage.removeItem('recipeAutoSave');
        }

        // Validation helpers
        function validateUrl(url) {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        }

        // Image URL validation
        document.getElementById('imageUrl').addEventListener('blur', function() {
            const url = this.value.trim();
            if (url && !validateUrl(url)) {
                this.setCustomValidity('Geçerli bir URL girin');
                this.classList.add('is-invalid');
            } else {
                this.setCustomValidity('');
                this.classList.remove('is-invalid');
                
                // Try to load image preview
                if (url) {
                    const preview = document.getElementById('imagePreview');
                    preview.src = url;
                    preview.style.display = 'block';
                    preview.onerror = function() {
                        showAlert('Görsel yüklenemedi. URL\'yi kontrol edin.', 'warning');
                        this.style.display = 'none';
                    };
                }
            }
        });

        // Form dirty state tracking
        let formIsDirty = false;
        
        function setFormDirty() {
            formIsDirty = true;
        }
        
        // Warn before leaving page if form has changes
        window.addEventListener('beforeunload', function(e) {
            if (formIsDirty) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        });

        // Track form changes
        document.getElementById('recipeForm').addEventListener('input', setFormDirty);
        document.getElementById('recipeForm').addEventListener('change', setFormDirty);
/**
 * CYBER ACADEMY - AVA.JS
 * Utilitários e funções auxiliares
 */

const AVA = {
    /**
     * Gera embed de vídeo baseado na URL
     */
    getVideoEmbed(url) {
        if (!url || url.trim() === '') {
            return `
                <div class="video-placeholder">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🎬</div>
                    <p>Vídeo não adicionado pelo instrutor</p>
                </div>
            `;
        }

        // YouTube
        const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
        if (youtubeMatch) {
            const videoId = youtubeMatch[1];
            return `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
        }

        // Vimeo
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) {
            const videoId = vimeoMatch[1];
            return `<iframe src="https://player.vimeo.com/video/${videoId}" frameborder="0" allowfullscreen></iframe>`;
        }

        // Blob ou arquivo local
        if (url.startsWith('blob:') || url.startsWith('data:')) {
            return `<video src="${url}" controls style="width: 100%; height: 100%;"></video>`;
        }

        // URL direta para arquivo de vídeo
        if (url.match(/\.(mp4|webm|ogg)$/i)) {
            return `<video src="${url}" controls style="width: 100%; height: 100%;"></video>`;
        }

        // Fallback: tenta como iframe
        return `<iframe src="${url}" frameborder="0" allowfullscreen></iframe>`;
    },

    /**
     * Calcula progresso da trilha
     */
    calcularProgressoTrilha(userId, trilhaId) {
        const trilha = DataManager.getTrilhaById(trilhaId);
        if (!trilha) return 0;

        const progresso = DataManager.getProgressoByUser(userId);
        const key = `${userId}_${trilhaId}`;
        const progressoTrilha = progresso[key] || {};

        // Conta total de aulas
        let totalAulas = 0;
        let aulasConcluidas = 0;

        trilha.modulos.forEach(modulo => {
            totalAulas += modulo.aulas.length;
            const aulasModulo = progressoTrilha[modulo.id] || [];
            aulasConcluidas += aulasModulo.length;
        });

        if (totalAulas === 0) return 0;
        return Math.round((aulasConcluidas / totalAulas) * 100);
    },

    /**
     * Encontra próxima aula não concluída
     */
    proximaAula(userId, trilhaId) {
        const trilha = DataManager.getTrilhaById(trilhaId);
        if (!trilha) return null;

        const progresso = DataManager.getProgressoByUser(userId);
        const key = `${userId}_${trilhaId}`;
        const progressoTrilha = progresso[key] || {};

        for (const modulo of trilha.modulos) {
            const aulasModulo = progressoTrilha[modulo.id] || [];
            
            for (const aula of modulo.aulas) {
                if (!aulasModulo.includes(aula.id)) {
                    return {
                        modulo: modulo,
                        aula: aula,
                        trilha: trilha
                    };
                }
            }
        }

        return null; // Todas as aulas concluídas
    },

    /**
     * Formata tamanho de arquivo
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Formata data
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    },

    /**
     * Mostra toast de notificação
     */
    showToast(message, type = 'success') {
        const container = document.querySelector('.toast-container') || this.createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️'
        };
        
        toast.innerHTML = `
            <span>${icons[type] || '📢'}</span>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Remove após 4 segundos
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    /**
     * Cria container de toasts se não existir
     */
    createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    },

    /**
     * Valida formulário
     */
    validateForm(formElement) {
        const inputs = formElement.querySelectorAll('[required]');
        let valid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = 'var(--danger)';
                valid = false;
            } else {
                input.style.borderColor = 'var(--border)';
            }
        });
        
        return valid;
    },

    /**
     * Modal genérico
     */
    showModal(content) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.innerHTML = `
            <div class="modal">
                ${content}
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Fecha ao clicar fora
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeModal(overlay);
            }
        });
        
        return overlay;
    },

    closeModal(overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    },

    /**
     * Verifica se todas aulas estão concluídas
     */
    isTrilhaCompleta(userId, trilhaId) {
        const progress = this.calcularProgressoTrilha(userId, trilhaId);
        return progress === 100;
    },

    /**
     * Gera iniciais do nome
     */
    getInitials(name) {
        return name.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substr(0, 2);
    },

    /**
     * Carrega dados assincronamente com loading
     */
    async loadWithLoading(promise, loadingElement = null) {
        if (loadingElement) loadingElement.style.display = 'block';
        
        try {
            const result = await promise;
            return result;
        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        } finally {
            if (loadingElement) loadingElement.style.display = 'none';
        }
    }
};

// Helper para detectar tipo de vídeo
function detectVideoType(url) {
    if (!url) return 'none';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    if (url.startsWith('blob:') || url.startsWith('data:')) return 'blob';
    if (url.match(/\.(mp4|webm|ogg)$/i)) return 'video';
    return 'iframe';
}

// Helper para debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Exporta para uso global
window.AVA = AVA;

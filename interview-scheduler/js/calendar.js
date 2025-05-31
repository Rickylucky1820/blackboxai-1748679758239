// Calendar component for Interview Scheduler

class InterviewCalendar {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            role: api.getRole(), // 'recruiter' or 'panel'
            onSlotClick: () => {}, // Callback for slot clicks
            onSlotHover: () => {}, // Callback for slot hover
            ...options
        };
        this.currentDate = new Date();
        this.slots = [];
        this.init();
    }

    init() {
        if (!this.container) return;
        this.render();
        this.attachEventListeners();
        this.loadData();
    }

    async loadData() {
        try {
            utils.showContainerLoading(this.container.id);
            if (this.options.role === 'panel') {
                // Load panel's availability
                const availability = await api.getAvailability();
                this.slots = availability.map(slot => ({
                    ...slot,
                    type: 'available'
                }));
            } else {
                // Load all panels' availability for recruiters
                const panels = await api.getPanels();
                const bookings = await api.getBookings();
                
                // Combine availability and bookings
                this.slots = [...panels, ...bookings].map(item => ({
                    ...item,
                    type: item.candidate_name ? 'booked' : 'available'
                }));
            }
            this.render();
        } catch (error) {
            utils.showToast(utils.formatErrorMessage(error), 'error');
        }
    }

    render() {
        if (!this.container) return;

        // Create calendar structure
        this.container.innerHTML = `
            <div class="calendar-container bg-gray-900 rounded-lg p-4">
                <div class="calendar-header flex justify-between items-center mb-4">
                    <button class="prev-month px-3 py-1 bg-gray-800 rounded hover:bg-gray-700">←</button>
                    <h2 class="text-lg font-semibold">${this.formatMonthYear()}</h2>
                    <button class="next-month px-3 py-1 bg-gray-800 rounded hover:bg-gray-700">→</button>
                </div>
                <div class="calendar-grid grid grid-cols-7 gap-1">
                    ${this.renderDayHeaders()}
                    ${this.renderDays()}
                </div>
                <div class="calendar-slots mt-4 space-y-2">
                    ${this.renderSlots()}
                </div>
            </div>
        `;
    }

    formatMonthYear() {
        return this.currentDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
    }

    renderDayHeaders() {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days.map(day => `
            <div class="text-center text-sm text-gray-400 py-2">${day}</div>
        `).join('');
    }

    renderDays() {
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const startPadding = firstDay.getDay();
        const totalDays = lastDay.getDate();
        
        let html = '';
        
        // Padding for start of month
        for (let i = 0; i < startPadding; i++) {
            html += '<div class="h-12 bg-gray-800 bg-opacity-50 rounded"></div>';
        }

        // Days of month
        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
            const dateStr = date.toISOString().split('T')[0];
            const hasSlots = this.slots.some(slot => slot.date === dateStr);
            
            html += `
                <div class="h-12 bg-gray-800 rounded p-1 relative ${hasSlots ? 'cursor-pointer hover:bg-gray-700' : ''}"
                     data-date="${dateStr}">
                    <span class="text-sm ${date.toDateString() === new Date().toDateString() ? 'text-white font-bold' : 'text-gray-400'}">${day}</span>
                    ${hasSlots ? '<div class="absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>' : ''}
                </div>
            `;
        }

        return html;
    }

    renderSlots() {
        const today = new Date().toISOString().split('T')[0];
        const slots = this.slots.filter(slot => slot.date === today);

        if (slots.length === 0) {
            return '<p class="text-gray-400 text-center">No slots available for selected date</p>';
        }

        return slots.map(slot => `
            <div class="slot p-3 rounded ${this.getSlotClass(slot.type)}" 
                 data-slot-id="${slot.id}"
                 data-panel-id="${slot.panel_id || ''}"
                 data-time="${slot.time || ''}"
                 role="button"
                 tabindex="0">
                <div class="flex justify-between items-center">
                    <span>${utils.formatTime(slot.time || slot.start_time)}</span>
                    <span class="text-sm ${slot.type === 'booked' ? 'text-red-400' : 'text-green-400'}">
                        ${this.getSlotStatus(slot)}
                    </span>
                </div>
                ${slot.candidate_name ? `<div class="text-sm mt-1">Candidate: ${slot.candidate_name}</div>` : ''}
            </div>
        `).join('');
    }

    getSlotClass(type) {
        switch (type) {
            case 'available':
                return 'bg-gray-800 hover:bg-gray-700';
            case 'booked':
                return 'bg-red-900 bg-opacity-50';
            case 'leave':
                return 'bg-gray-700 bg-opacity-50';
            default:
                return 'bg-gray-800';
        }
    }

    getSlotStatus(slot) {
        switch (slot.type) {
            case 'available':
                return 'Available';
            case 'booked':
                return 'Booked';
            case 'leave':
                return 'Leave';
            default:
                return '';
        }
    }

    attachEventListeners() {
        if (!this.container) return;

        // Month navigation
        this.container.querySelector('.prev-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.render();
        });

        this.container.querySelector('.next-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.render();
        });

        // Day selection
        this.container.addEventListener('click', (e) => {
            const dayEl = e.target.closest('[data-date]');
            if (dayEl) {
                const date = dayEl.dataset.date;
                this.selectDate(date);
            }
        });

        // Slot selection
        this.container.addEventListener('click', (e) => {
            const slotEl = e.target.closest('.slot');
            if (slotEl) {
                const slotId = slotEl.dataset.slotId;
                const panelId = slotEl.dataset.panelId;
                const time = slotEl.dataset.time;
                this.options.onSlotClick({ slotId, panelId, time });
            }
        });
    }

    selectDate(date) {
        this.currentDate = new Date(date);
        this.loadData();
    }

    // Public methods
    refresh() {
        this.loadData();
    }

    setDate(date) {
        this.currentDate = new Date(date);
        this.render();
    }
}

// Export for use in other files
window.InterviewCalendar = InterviewCalendar;

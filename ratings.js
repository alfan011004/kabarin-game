// Ratings System using Local Storage
class RatingsSystem {
    constructor() {
        this.ratings = JSON.parse(localStorage.getItem('game_ratings')) || {};
        this.init();
    }

    init() {
        this.loadAllRatings();
        this.setupEventListeners();
    }

    // Load ratings for all games
    loadAllRatings() {
        const games = ['cyberpunk', 'zelda', 'baldurs-gate'];
        
        games.forEach(game => {
            this.displayRatings(game);
        });
    }

    // Display ratings for a specific game
    displayRatings(gameId) {
        const container = document.getElementById(`ratings-${gameId}`);
        const gameRatings = this.ratings[gameId] || [];

        if (gameRatings.length === 0) {
            container.innerHTML = '<p class="no-ratings">Belum ada rating untuk game ini.</p>';
            return;
        }

        // Show latest 3 ratings
        const recentRatings = gameRatings.slice(-3).reverse();
        
        container.innerHTML = recentRatings.map(rating => `
            <div class="user-rating">
                <div class="user-avatar">${rating.username.charAt(0).toUpperCase()}</div>
                <div class="user-info">
                    <div class="user-name">${rating.username}</div>
                    <div class="user-stars">${this.generateStars(rating.rating)}</div>
                    ${rating.comment ? `<div class="user-comment">${rating.comment}</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    // Generate star HTML
    generateStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i - 0.5 === rating) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    }

    // Add new rating
    addRating(gameId, gameName, rating, comment = '') {
        if (!auth.isLoggedIn()) {
            showMessage('Silakan login terlebih dahulu untuk memberikan rating', 'warning');
            modalManager.openModal('loginModal');
            return false;
        }

        const user = auth.getCurrentUser();
        const newRating = {
            id: Date.now().toString(),
            gameId,
            gameName,
            username: user.username,
            rating: parseInt(rating),
            comment: comment.trim(),
            createdAt: new Date().toISOString()
        };

        // Initialize array if it doesn't exist
        if (!this.ratings[gameId]) {
            this.ratings[gameId] = [];
        }

        // Check if user already rated this game
        const existingRatingIndex = this.ratings[gameId].findIndex(
            r => r.username === user.username
        );

        if (existingRatingIndex !== -1) {
            // Update existing rating
            this.ratings[gameId][existingRatingIndex] = newRating;
        } else {
            // Add new rating
            this.ratings[gameId].push(newRating);
        }

        // Save to localStorage
        localStorage.setItem('game_ratings', JSON.stringify(this.ratings));

        // Update display
        this.displayRatings(gameId);

        return true;
    }

    // Get average rating for a game
    getAverageRating(gameId) {
        const gameRatings = this.ratings[gameId] || [];
        if (gameRatings.length === 0) return 0;

        const total = gameRatings.reduce((sum, rating) => sum + rating.rating, 0);
        return (total / gameRatings.length).toFixed(1);
    }

    // Get user's rating for a game
    getUserRating(gameId) {
        if (!auth.isLoggedIn()) return null;
        
        const user = auth.getCurrentUser();
        const gameRatings = this.ratings[gameId] || [];
        
        return gameRatings.find(rating => rating.username === user.username);
    }

    // Setup event listeners
    setupEventListeners() {
        // Add rating buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-rating-btn')) {
                const button = e.target;
                const gameId = button.getAttribute('data-game');
                const gameName = button.getAttribute('data-game-name');

                if (!auth.isLoggedIn()) {
                    showMessage('Silakan login terlebih dahulu untuk memberikan rating', 'warning');
                    modalManager.openModal('loginModal');
                    return;
                }

                // Open rating modal
                this.openRatingModal(gameId, gameName);
            }
        });

        // Rating form submission
        document.getElementById('ratingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const gameId = document.getElementById('ratingGameId').value;
            const rating = document.querySelector('input[name="rating"]:checked');
            const comment = document.getElementById('ratingComment').value;

            if (!rating) {
                showMessage('Silakan pilih rating bintang', 'warning');
                return;
            }

            const success = this.addRating(gameId, '', rating.value, comment);
            
            if (success) {
                modalManager.closeModal('ratingModal');
                showMessage('Rating berhasil disimpan!', 'success');
            }
        });
    }

    // Open rating modal
    openRatingModal(gameId, gameName) {
        document.getElementById('ratingModalTitle').textContent = `Beri Rating ${gameName}`;
        document.getElementById('ratingGameId').value = gameId;

        // Check if user already rated this game
        const existingRating = this.getUserRating(gameId);
        if (existingRating) {
            // Pre-fill existing rating
            document.querySelector(`input[name="rating"][value="${existingRating.rating}"]`).checked = true;
            document.getElementById('ratingComment').value = existingRating.comment || '';
        } else {
            // Reset form
            document.querySelector('input[name="rating"]:checked')?.checked = false;
            document.getElementById('ratingComment').value = '';
        }

        modalManager.openModal('ratingModal');
    }
}

// Initialize ratings system
const ratingsSystem = new RatingsSystem();
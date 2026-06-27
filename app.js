// Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    showProjects();
  }
});

function updateYearOptions() {

    const department = document.getElementById("department").value;
    const yearSelect = document.getElementById("year");

    // Clear previous options
    yearSelect.innerHTML = '<option value="">Select Year</option>';

    let years = [];

    switch (department) {

        case "ACSE":
            years = [2022, 2023, 2024, 2025];
            break;

        case "AIDS":
            years = [2022, 2023, 2024, 2025];
            break;

        case "CSE":
        case "ECE":
        case "EEE":
        case "IT":
        case "MECH":
        case "CIVIL":
            years = [2021, 2022, 2023, 2024, 2025];
            break;

        default:
            years = [];
    }

    years.forEach(year => {

        yearSelect.innerHTML += `
            <option value="${year}">
                ${year}
            </option>
        `;

    });

}

function openReviewModal() {
  const modal = document.getElementById('reviewModal');
  modal.style.display = 'flex';
  modal.classList.add('fade-in');
}

function closeReviewModal() {
  const modal = document.getElementById('reviewModal');
  modal.classList.add('fade-out');
  setTimeout(() => {
    modal.style.display = 'none';
    modal.classList.remove('fade-out');
  }, 300);
}

document.querySelectorAll('.star-rating').forEach(ratingGroup => {
  ratingGroup.querySelectorAll('.star').forEach(star => {
    star.addEventListener('click', () => {
      const value = parseInt(star.dataset.value);
      ratingGroup.dataset.rating = value;
      updateStars(ratingGroup, value);
    });
  });
});

function updateStars(ratingGroup, value) {
  ratingGroup.querySelectorAll('.star').forEach(star => {
    const starValue = parseInt(star.dataset.value);
    star.classList.toggle('active', starValue <= value);
  });
}

function validateReviewForm() {
  const userName = document.getElementById('userName').value;
  const interfaceRating = document.getElementById('interfaceRating').dataset.rating;
  const contentRating = document.getElementById('contentRating').dataset.rating;
  const usabilityRating = document.getElementById('usabilityRating').dataset.rating;
  const feedbackSuggestion = document.getElementById('feedback').value;

  if (!userName || !interfaceRating || !contentRating || !usabilityRating || !feedbackSuggestion) {
    alert('All fields are required!');
    return false;
  }
  return true;
}

async function submitReview(event) {
  event.preventDefault();

  const reviewData = {
    user_name: document.getElementById('userName').value,
    interface_rating: parseInt(document.getElementById('interfaceRating').dataset.rating),
    content_rating: parseInt(document.getElementById('contentRating').dataset.rating),
    usability_rating: parseInt(document.getElementById('usabilityRating').dataset.rating),
    feedback_suggestion: document.getElementById('feedback').value
  };

  try {
    await db.collection("reviews").add(reviewData);

    alert('Recorded successfully');
    document.getElementById('reviewForm').reset();
    resetStarRatings();
    closeReviewModal();
  } catch (error) {
    console.error('Error submitting review:', error);
    alert('Failed to record the review. Please try again.');
  }
}

function resetStarRatings() {
  document.querySelectorAll('.star-rating').forEach(ratingGroup => {
    ratingGroup.dataset.rating = 0;
    ratingGroup.querySelectorAll('.star').forEach(star => {
      star.classList.remove('active');
    });
  });
}

async function showProjects() {

  const department = document.getElementById("department").value;
  const year = document.getElementById("year").value;
  const container = document.getElementById("projectsContainer");

  if (!department || !year) {
    container.innerHTML = `
      <div class="no-projects">
        <h3>Please select both department and year</h3>
      </div>
    `;
    return;
  }

  // Department name → department_id
  const departmentMap = {
  "EEE": 1,
  "ACSE": 2,
  "CSE": 3,
  "ECE": 4,
  "IT": 5,
  "MECH": 6,
  "CIVIL": 7,
  "AIDS": 8
};

  // Year → year_id
 const yearMap = {
  "2021": 2,
  "2022": 3,
  "2023": 4,
  "2024": 5,
  "2025": 6
};

  const departmentId = departmentMap[department];
  const yearId = yearMap[year];

  try {

    const snapshot = await db
      .collection("projects")
      .where("department_id", "==", departmentId)
      .where("year_id", "==", yearId)
      .get();

    if (snapshot.empty) {

      container.innerHTML = `
        <div class="no-projects">
          <h3>No projects found for ${department} - ${year}</h3>
          <p>Please select a different department or year.</p>
        </div>
      `;

      return;
    }

    const projects = [];

    snapshot.forEach(doc => {
      projects.push(doc.data());
    });

    container.innerHTML = `
      <div class="projects-summary">
        Found ${projects.length} projects
      </div>

      <div class="projects-grid">
        ${projects.map(project => createProjectCard(project)).join("")}
      </div>
    `;

  } catch (error) {

    console.error(error);

    container.innerHTML = `
      <div class="no-projects">
        <h3>Error fetching projects</h3>
        <p>Please try again later.</p>
      </div>
    `;

  }

}

function createProjectCard(project) {
  return `
    <div class="project-card" onclick='showProjectDetailsModal(${JSON.stringify(project)})'>
      <img src="${project.image}" alt="${project.title}" class="project-image">
      <div class="project-content">
        <h3 class="project-title">${project.title}</h3>
        ${project.team ? `
          <div class="project-info">
            <p>${project.team}</p>
          </div>
        ` : ''}
        ${project.description ? `
          <p class="project-description">${project.description}</p>
        ` : ''}
      </div>
    </div>
  `;
}

function showProjectDetailsModal(project) {
  const modal = document.getElementById('projectDetailsModal');
  document.getElementById('projectModalTitle').textContent = project.title;
  document.getElementById('projectModalDescription').textContent = project.description || 'No description available';
  
  // Set project image
  const projectImage = document.getElementById('projectModalImage');
  projectImage.src = project.image || 'default-image.jpg';
  projectImage.alt = project.title;

  // Set up GitHub repository link
  const githubLink = document.getElementById('projectRepoLink');
  if (project.repository && project.repository !== '#') {
    githubLink.href = project.repository;
    githubLink.onclick = function(event) {
      event.preventDefault();
      event.stopPropagation();
      window.open(project.repository, '_blank');
    };
  } else {
    githubLink.href = '#';
    githubLink.onclick = function(event) {
      event.preventDefault();
      alert('No repository URL available for this project');
    };
  }

  // Set up AI assistant links
  const aiLinks = document.querySelectorAll('.ai-link:not(#projectRepoLink)');
  aiLinks.forEach(link => {
    link.onclick = function(event) {
      event.preventDefault();
      const textToCopy = `${project.title} - ${project.description} - project overlook & requirements`;
      
      navigator.clipboard.writeText(textToCopy).then(() => {
        window.open(this.href, '_blank');
      }).catch(err => {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Failed to copy details');
        }
        document.body.removeChild(textArea);
        window.open(this.href, '_blank');
      });
    };
  });

  modal.style.display = 'flex';
}

function closeProjectDetailsModal() {
  const modal = document.getElementById('projectDetailsModal');
  modal.style.display = 'none';
}

function openAboutUsModal() {
  const modal = document.getElementById('aboutUsModal');
  modal.style.display = 'flex';
}

function closeAboutUsModal() {
  const modal = document.getElementById('aboutUsModal');
  modal.style.display = 'none';
}

function openMotiveModal() {
  const modal = document.getElementById('motiveModal');
  modal.style.display = 'flex';
  modal.classList.add('fade-in');
}

function closeMotiveModal() {
  const modal = document.getElementById('motiveModal');
  modal.classList.add('fade-out');
  setTimeout(() => {
    modal.style.display = 'none';
    modal.classList.remove('fade-out');
  }, 300);
}

async function viewReviews() {
  const viewReviewsList = document.getElementById('viewReviewsList');

  try {
    const snapshot = await db.collection("reviews").get();

const reviews = [];

snapshot.forEach(doc => {
  reviews.push(doc.data());
});

    if (reviews.length === 0) {
      viewReviewsList.innerHTML = `
        <div class="no-reviews">
          <h4>No reviews available</h4>
          <p>Be the first to leave a review!</p>
        </div>
      `;
      
    } else {
      viewReviewsList.innerHTML = reviews
        .map(review => createReviewItem(review))
        .join('');
    }
    

    openViewReviewsModal();
  } catch (error) {
    console.error('Error fetching reviews:', error);
    viewReviewsList.innerHTML = `
      <div class="no-reviews">
        <h4>Error fetching reviews</h4>
        <p>Please try again later.</p>
      </div>
    `;
    openViewReviewsModal();
  }
}

function openViewReviewsModal() {
  const modal = document.getElementById('viewReviewsModal');
  modal.style.display = 'block';
}

function closeViewReviewsModal() {
  const modal = document.getElementById('viewReviewsModal');
  modal.style.display = 'none';
}

function createReviewItem(review) {
  return `
    <div class="review-item">
      <h4>${review.user_name}</h4>
      <p><strong>Interface Rating:</strong> ${review.interface_rating} / 5</p>
      <p><strong>Content Rating:</strong> ${review.content_rating} / 5</p>
      <p><strong>Usability Rating:</strong> ${review.usability_rating} / 5</p>
      <p><strong>Feedback/Suggestion:</strong> ${review.feedback_suggestion}</p>
    </div>
  `;
}
function openVersionModal() {
    document.getElementById("versionModal").style.display = "flex";
}

function closeVersionModal() {
    document.getElementById("versionModal").style.display = "none";
}

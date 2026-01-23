import React from 'react';
import './About.css';

const About = () => {
  const teamMembers = [
    {
      id: 1,
      name: 'AMBANAWAH CARLOS',
      role: 'Scrum Master & Developer',
      description: 'Leads the team coordination and development efforts, ensuring smooth project execution and agile practices.',
      expertise: ['Project Management', 'Full Stack Development', 'Team Leadership']
    },
    {
      id: 2,
      name: 'Narmaye Gbaman Patrick Joyce',
      role: 'Product Owner',
      description: 'Defines product vision, manages requirements, and ensures the platform meets user needs and business goals.',
      expertise: ['Product Strategy', 'Requirements Management', 'User Experience']
    }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About Dishcovery</h1>
          <p>Connecting food lovers with exceptional dining experiences</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="mission-container">
          <h2>Our Mission</h2>
          <p>
            Dishcovery is revolutionizing how people discover, explore, and share their dining experiences. 
            We believe that food is more than just sustenance—it's a journey of discovery, cultural exploration, 
            and community connection.
          </p>
          <div className="mission-grid">
            <div className="mission-card">
              <div className="mission-icon">🔍</div>
              <h3>Discover</h3>
              <p>Find hidden gems and popular restaurants tailored to your taste</p>
            </div>
            <div className="mission-card">
              <div className="mission-icon">⭐</div>
              <h3>Share</h3>
              <p>Share your dining experiences and help others make informed choices</p>
            </div>
            <div className="mission-card">
              <div className="mission-icon">👥</div>
              <h3>Connect</h3>
              <p>Connect with fellow food enthusiasts and restaurant owners</p>
            </div>
            <div className="mission-card">
              <div className="mission-icon">🎯</div>
              <h3>Empower</h3>
              <p>Empower restaurants to reach more customers and grow their business</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="team-container">
          <h2>Meet Our Team</h2>
          <p className="team-subtitle">Dedicated professionals building the future of dining discovery</p>
          
          <div className="team-grid">
            {teamMembers.map((member) => (
              <div key={member.id} className="team-card">
                <div className="member-image-placeholder">
                  <div className="placeholder-text">Photo</div>
                </div>
                <div className="member-info">
                  <h3>{member.name}</h3>
                  <p className="member-role">{member.role}</p>
                  <p className="member-description">{member.description}</p>
                  <div className="expertise-tags">
                    {member.expertise.map((skill, idx) => (
                      <span key={idx} className="expertise-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="values-container">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-item">
              <h3>🏆 Excellence</h3>
              <p>We strive for excellence in every aspect of our platform and service</p>
            </div>
            <div className="value-item">
              <h3>🤝 Integrity</h3>
              <p>We conduct our business with honesty, transparency, and ethical practices</p>
            </div>
            <div className="value-item">
              <h3>💡 Innovation</h3>
              <p>We continuously innovate to improve the dining discovery experience</p>
            </div>
            <div className="value-item">
              <h3>❤️ Community</h3>
              <p>We foster a vibrant community of food lovers and restaurant partners</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="about-cta-content">
          <h2>Ready to Discover Your Next Favorite Restaurant?</h2>
          <p>Join thousands of food enthusiasts exploring culinary excellence</p>
          <button className="cta-button">Start Exploring</button>
        </div>
      </section>
    </div>
  );
};

export default About;

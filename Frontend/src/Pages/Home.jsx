/* eslint-disable react/no-unescaped-entities */
// eslint-disable-next-line no-unused-vars
import React from 'react';
import '../HomePage.css';

function HomePage() {
  return (
    <div className="homepage">
      {/* Frame 1: Login Section */}
      <div className="login-section">
        <h1>Login</h1>
        <p>A community for travellers</p>
        <button className="join-button">Join →</button>
      </div>

      {/* Travel in Style Section */}
      <div className="travel-style-section">
        <h2>Travel in style</h2>
        <p>
          Whether it's beautiful destinations or thrilling experiences, ignite your wanderlust and discover new reasons to travel and explore.
        </p>
        <button className="create-button">Create →</button>
      </div>

      {/* Member Benefits Section */}
      <div className="member-benefits-section">
        <h2>Member benefits</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <h3>READ MORE</h3>
          </div>
          <div className="benefit-card">
            <h3>READ MORE</h3>
          </div>
          <div className="benefit-card">
            <h3>READ MORE</h3>
          </div>
          <div className="benefit-card">
            <h3>READ MORE</h3>
          </div>
        </div>
      </div>

      {/* Travel Packages Section */}
      <div className="travel-packages-section">
        <h2>TRAVEL PACKAGES</h2>
        <p>
          Lower lawns drive six areas: connection-addressing air. Redirectory performance means art, as could be visible in the S&P state for pets too, stock cards and square apps. Can a materiality well pass distribution in sector top style. In both ways, schools is drawn over, unique channels like Cars View and more than couple of projects. Distinct places or games, build insights across objects.
        </p>
      </div>

      {/* Quick Links Section */}
      <div className="quick-links-section">
        <h2>QUICK LINES</h2>
        <ul>
          <li>HOME</li>
          <li>BLOG</li>
          <li>SPORT</li>
          <li>GREAT DROP TRIP</li>
          <li>CREATE EXPOSES</li>
        </ul>
      </div>

      {/* Contact Us Section */}
      <div className="contact-us-section">
        <h2>CONTACT US</h2>
        <p>Phone Number: -271 (0) 1967-8100</p>
        <p>Email: info@cardboardshop.com</p>
      </div>
    </div>
  );
}

export default HomePage;

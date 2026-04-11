import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';
import heroBook from '../assets/book3.png';
import promoBook from '../assets/book2.png';
import logo from '../assets/booklogo.png';


const GENRES = [
    { name: 'Technology', desc: 'Master modern tech with books on programming, AI, and software engineering.' },
    { name: 'Fiction', desc: 'Immerse yourself in captivating worlds of imagination and storytelling.' },
    { name: 'Education', desc: 'Expand your knowledge with expertly written educational resources.' },
    { name: 'Science', desc: 'Explore the universe through books on physics, biology, and beyond.' },
    { name: 'History', desc: "Discover humanity's greatest stories through the lens of history." },
    { name: 'Biography', desc: "Celebrate unique voices and lives of the world's most inspiring people." },
];

export default function Home() {
    const { user } = useAuth();

    return (
        <div className="home">

            {/* ── HERO ─────────────────────────────────── */}
            <section className="home-hero">
                <div className="hero-text">
                    <h1 className="hero-headline">
                        STORYTELLING<br />SANCTUARY
                    </h1>
                    <p className="hero-sub">
                        Discover a world of stories, genres, and authors curated just for you
                    </p>
                    <p className="hero-desc">
                        Through our innovative recommendation system, we ensure that each visit is a delightful discovery of new literary gems tailored to your unique tastes.
                    </p>
                    <div className="hero-ctas">
                        <Link to="/books" className="btn-hero-primary">Shop All</Link>
                        {!user && (
                            <>
                                <Link to="/login" className="btn-hero-outline">Log In</Link>
                                <Link to="/register" className="btn-hero-outline">Register Free</Link>
                            </>
                        )}
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="hero-book-stack">

                        <img src={heroBook} alt="Hero Book" className="hero-book-img book-2" />

                    </div>

                </div>
            </section>

            {/* ── OUR STORY ────────────────────────────── */}
            <section className="home-story">
                <p className="section-label">Our Story</p>
                <p className="story-text">
                    At BookStore, we're passionate about bringing book lovers together. We offer a diverse selection of technology, fiction, nonfiction, science, history, and biography to cater to every reader's taste.
                </p>
                <div className="story-stats">
                    <div className="stat"><span className="stat-num">500+</span><span className="stat-label">Books</span></div>
                    <div className="stat"><span className="stat-num">6</span><span className="stat-label">Genres</span></div>
                    <div className="stat"><span className="stat-num">1000+</span><span className="stat-label">Happy Readers</span></div>
                </div>
            </section>

            {/* ── COLLECTION GALLERY ───────────────────── */}
            <section className="home-collection">
                <div className="collection-left">
                    <h2 className="collection-title">Book<br />Collection<br />Gallery</h2>
                    <p className="collection-desc">
                        Dive into our vast collection of books that cover a wide range of genres, from gripping fiction to thought-provoking science.
                    </p>
                    <Link to="/books" className="btn-collection">Browse All →</Link>
                </div>
                <div className="collection-right">
                    {GENRES.map((g) => (
                        <div key={g.name} className="genre-item">
                            <h3 className="genre-item-name">{g.name}</h3>
                            <p className="genre-item-desc">{g.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── LIMITED OFFER TICKER ─────────────────── */}
            <div className="ticker-bar">
                <div className="ticker-content">
                    {Array(6).fill('📚 New Arrivals · Limited Time Offers · Free Shipping on Orders ₹500+ ·').map((t, i) => (
                        <span key={i}>{t}&nbsp;&nbsp;&nbsp;</span>
                    ))}
                </div>
            </div>

            {/* ── CTA SECTION ──────────────────────────── */}
            <section className="home-cta">
                <div className="cta-left">
                    <div className="cta-book-visual">
                        <img src={promoBook} alt="Promo Book" className="cta-book-img" />
                    </div>

                </div>
                <div className="cta-right">
                    <p className="cta-overline">Grab Your Favorites Now</p>
                    <h2 className="cta-title">Exclusive<br />Deals</h2>
                    <p className="cta-desc">
                        Don't miss out on our special promotions and discounts. Treat yourself to the joy of reading with our exclusive offers.
                    </p>
                    <Link to={user ? '/books' : '/register'} className="btn-hero-primary">
                        {user ? 'Shop Now' : 'Sign Up & Shop'}
                    </Link>
                </div>
            </section>

            {/* ── FAQ ──────────────────────────────────── */}
            <section className="home-faq">
                <div className="faq-left">
                    <h2 className="faq-title">Frequently<br />Asked<br />Questions</h2>
                    <p className="faq-sub">Find answers to common queries about our bookstore, services, and offerings.</p>
                </div>
                <div className="faq-right">
                    {[
                        { q: 'Ordering Process', a: 'Browse our collection, add to wishlist, and place your order seamlessly through your account.' },
                        { q: 'Shipping & Delivery', a: 'We offer fast delivery with real-time order tracking available in your account dashboard.' },
                        { q: 'Returns & Refunds', a: 'Understand our policies regarding returns and refunds to ensure a smooth shopping experience.' },
                        { q: 'How do I write a review?', a: 'Open any book detail page, scroll to the Reviews section, and submit your star rating and comment.' },
                    ].map((faq) => (
                        <div key={faq.q} className="faq-item">
                            <h3 className="faq-q">{faq.q}</h3>
                            <p className="faq-a">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FOOTER ───────────────────────────────── */}
            <footer className="home-footer">
                <div className="footer-brand">
                    <img src={logo} alt="BookStore Logo" className="footer-logo" />
                    BookStore
                </div>

                <div className="footer-links">
                    <Link to="/books">Shop All</Link>
                    <Link to="/login">Log In</Link>
                    <Link to="/register">Register</Link>
                </div>
                <p className="footer-copy">© 2026 BookStore. All rights reserved.</p>
            </footer>

        </div>
    );
}

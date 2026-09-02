// Package seed populates the courses and settings tables with the catalogue and
// configuration that used to be hardcoded in the frontend. It is idempotent:
// courses are only seeded when the table is empty, and each default setting is
// only inserted when that key is missing — so it never overwrites admin edits.
package seed

import (
	"log"

	"imagine_backend/internal/models"

	"gorm.io/gorm"
)

func img(path string) string {
	return "https://images.unsplash.com/" + path + "?auto=format&fit=crop&q=80&w=400&h=225"
}

// Run seeds settings (always, missing-key only) and courses (only if empty).
func Run(db *gorm.DB) {
	seedSettings(db)
	seedCourses(db)
}

func seedSettings(db *gorm.DB) {
	defaults := map[string]string{
		// Contact
		"contact_phone":     "+91 7974889250",
		"contact_phone_raw": "917974889250",
		"contact_email":     "info@gyaanpathdigital.in",
		"contact_address":   "Anand kunj garha, jabalpur, Madhya Pradesh, 482003",
		// Hero / marketing
		"hero_title":     "Learn Skills, Build Careers, Create Opportunities",
		"hero_subtitle":  "Join our Daily Live Interactive Program and upgrade your skills for a better career and life.",
		"footer_tagline": "Learn Skills, Build Careers, Create Opportunities. Join our daily live program and take the right step towards a better future.",
		// Plans / prices
		"plan_basic_name":       "GyaanPath Digital Career Development Program",
		"plan_basic_price":      "399",
		"plan_basic_blurb":      "Gain full access to all 15 comprehensive lifestyle and skill development courses. Transform your future today.",
		"plan_additional_name":  "Additional Support - Full Access",
		"plan_additional_price": "399",
		"plan_additional_blurb": "Unlock 7 vital support services including legal, medical, and career guidance. We stand exclusively with you.",
		"plan_upcoming_blurb":   "Prepare yourself for our next wave of comprehensive courses coming soon.",
		"plan_upcoming_price":   "499",
		// Private WhatsApp group students are sent to after paying — class
		// links and updates are shared only there, so this is the one
		// post-purchase action that matters.
		"whatsapp_group_link": "https://chat.whatsapp.com/DJ8KtcQWDPqIF5M8ppwscV?s=cl&p=a&mlu=4",
	}

	created := 0
	for key, val := range defaults {
		var count int64
		db.Model(&models.Setting{}).Where("key = ?", key).Count(&count)
		if count == 0 {
			if err := db.Create(&models.Setting{Key: key, Value: val}).Error; err != nil {
				log.Printf("seed: failed to insert setting %q: %v", key, err)
				continue
			}
			created++
		}
	}
	if created > 0 {
		log.Printf("seed: inserted %d default settings", created)
	}
}

func seedCourses(db *gorm.DB) {
	var count int64
	db.Model(&models.Course{}).Count(&count)
	if count > 0 {
		return // already populated — never clobber admin-managed data
	}

	courses := []models.Course{}
	add := func(cat, title, desc, image string) {
		courses = append(courses, models.Course{
			Title: title, Description: desc, ImageURL: image,
			Category: cat, Status: models.CourseStatusActive, SortOrder: len(courses),
		})
	}

	// Basic Plan
	add(models.CourseCategoryBasic, "Spoken English", "Enhance your communication skills with practical English speaking sessions.", img("photo-1528605105345-5344ea20e269"))
	add(models.CourseCategoryBasic, "MS Office", "Master Word, Excel, and PowerPoint for professional productivity.", img("photo-1517842645767-c639042777db"))
	add(models.CourseCategoryBasic, "Tally", "Learn industry-standard accounting and bookkeeping with Tally.", img("photo-1554224155-6726b3ff858f"))
	add(models.CourseCategoryBasic, "Share Market Trading", "Understand stock markets, investing, and trading strategies.", img("photo-1611974789855-9c2a0a7236a3"))
	add(models.CourseCategoryBasic, "CV/Resume Building", "Craft compelling resumes that stand out to recruiters.", img("photo-1586281380117-5a60ae2050cc"))
	add(models.CourseCategoryBasic, "Interview Preparation", "Mock interviews, tips, and strategies to ace your next job interview.", img("photo-1573497019940-1c28c88b4f3e"))
	add(models.CourseCategoryBasic, "Career Guidance and Counselling", "Find your true calling and plan your career path with experts.", img("photo-1521737604893-d14cc237f11d"))
	add(models.CourseCategoryBasic, "Devotional Teaching", "Explore spiritual texts, meditation, and devotional practices.", img("photo-1447069387593-a5de0862481e"))
	add(models.CourseCategoryBasic, "Beautician Classes", "Professional makeup, skin care, and salon management skills.", img("photo-1560066984-138dadb4c035"))
	add(models.CourseCategoryBasic, "Digital Literacy", "Essential internet, email, and online safety skills for everyone.", img("photo-1504384308090-c894fdcc538d"))
	add(models.CourseCategoryBasic, "Yoga and Wellness", "Physical and mental well-being through yoga asanas and breathwork.", img("photo-1544367567-0f2fcb009e0b"))
	add(models.CourseCategoryBasic, "Business Setup Guide", "Step-by-step guidance on starting and managing a small business.", img("photo-1556761175-4b46a572b786"))
	add(models.CourseCategoryBasic, "Computer Basic", "Fundamental computer operations and hardware understanding.", img("photo-1517694712202-14dd9538aa97"))
	add(models.CourseCategoryBasic, "Personality development and public speaking", "Build confidence and learn to communicate effectively in public.", img("photo-1521791136064-7986c2920216"))
	add(models.CourseCategoryBasic, "AI fundamentals", "Introduction to artificial intelligence, tools, and basic applications.", img("photo-1677442136019-21780ecad995"))

	// Additional Support
	add(models.CourseCategoryAdditional, "Advocate Support and Legal Awareness", "Get legal advice and understand your rights with our expert advocates.", img("photo-1589829085413-56de8ae18c73"))
	add(models.CourseCategoryAdditional, "Medical Support", "Access essential medical guidance, consultations, and health support.", img("photo-1505751172876-fa1923c5c528"))
	add(models.CourseCategoryAdditional, "Agriculture and Crop Medicine Guidance", "Expert advice on modern agriculture practices and crop medicines.", img("photo-1586771107445-d3ca888129ff"))
	add(models.CourseCategoryAdditional, "Government Scheme Awareness", "Stay updated and informed about various beneficial government schemes.", img("photo-1573164713988-8665fc963095"))
	add(models.CourseCategoryAdditional, "Latest Government, Local and MNC Job Alerts", "Receive timely notifications for job openings across multiple sectors.", img("photo-1486312338219-ce68d2c6f44d"))
	add(models.CourseCategoryAdditional, "Motivational Session", "Attend inspiring sessions to boost your morale and career drive.", img("photo-1526948128573-703ee1aeb6fa"))
	add(models.CourseCategoryAdditional, "Placement/ Employment", "Dedicated placement assistance to help you secure the ideal job.", img("photo-1521737711867-e3b97375f902"))

	// Premium (own price + feature list)
	courses = append(courses, models.Course{
		Title:       "Website Development",
		Description: "Dive deep into the world of web development. Learn to build responsive, dynamic, and user-friendly websites from scratch using modern technologies and industry best practices.",
		ImageURL:    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800&h=450",
		Category:    models.CourseCategoryPremium, Price: 500, Status: models.CourseStatusActive, SortOrder: len(courses),
		Features: []string{"HTML, CSS & JavaScript fundamentals", "Modern frameworks (React & Tailwind)", "Responsive design principles", "Real-world project building"},
	})
	courses = append(courses, models.Course{
		Title:       "Dancing Masterclass",
		Description: "Express yourself through the rhythm of music. Join our intensive dancing course to master various dance styles, improve your flexibility, and perform with confidence on stage.",
		ImageURL:    "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=800&h=450",
		Category:    models.CourseCategoryPremium, Price: 500, Status: models.CourseStatusActive, SortOrder: len(courses),
		Features: []string{"Hip-Hop & Contemporary styles", "Flexibility & Rhythm training", "Stage performance skills", "Choreography fundamentals"},
	})

	// Upcoming (Coming Soon)
	add(models.CourseCategoryUpcoming, "Web designing", "Learn to design and build stunning, responsive websites.", img("photo-1498050108023-c5249f4df085"))
	add(models.CourseCategoryUpcoming, "Graphic designing", "Create visual content to communicate messages effectively.", img("photo-1561070791-2526d30994b5"))
	add(models.CourseCategoryUpcoming, "Data entry", "Develop fast and accurate data transcription skills.", img("photo-1454165804606-c3d57bc86b40"))
	add(models.CourseCategoryUpcoming, "Singing", "Vocal training and techniques for aspiring singers.", img("photo-1516280440502-601726a4dbec"))
	add(models.CourseCategoryUpcoming, "Dancing", "Express yourself through various dance forms and choreography.", img("photo-1547153760-18fc86324498"))
	add(models.CourseCategoryUpcoming, "Food Processing and Preservation", "Learn techniques to process, package, and preserve food safely.", img("photo-1506459225024-1428097a7e18"))
	add(models.CourseCategoryUpcoming, "Digital Marketing", "Master SEO, social media, and online advertising.", img("photo-1460925895917-afdab827c52f"))
	add(models.CourseCategoryUpcoming, "Basic electrical work and wiring", "Practical training on household wiring and electrical safety.", img("photo-1621905252507-b35492cc74b4"))
	add(models.CourseCategoryUpcoming, "Mobile repairing and servicing", "Diagnose and fix hardware and software issues in mobile phones.", img("photo-1597872200969-2b65d56bd16b"))
	add(models.CourseCategoryUpcoming, "Financial literacy and banking", "Understand banking systems, savings, and financial planning.", img("photo-1554224155-8d04cb21cd6c"))
	add(models.CourseCategoryUpcoming, "E-commerce and online selling", "Start and grow your own online retail business.", img("photo-1556742049-0cfed4f6a45d"))
	add(models.CourseCategoryUpcoming, "Tailoring and Fashion designing", "Garment construction, pattern making, and fashion design basics.", img("photo-1556905055-8f358a7a47b2"))
	add(models.CourseCategoryUpcoming, "Classes for class 5th to 12th", "Comprehensive subject coaching for school students.", img("photo-1497633762265-9d179a990aa6"))
	add(models.CourseCategoryUpcoming, "Classes for Graduate in different stream", "Specialized tutorials and guidance for college graduates.", img("photo-1541339907198-e08756dedf3f"))
	add(models.CourseCategoryUpcoming, "Diploma classes", "Skill-focused learning for various technical and non-technical diplomas.", img("photo-1523580494863-6f3031224c94"))

	if err := db.Create(&courses).Error; err != nil {
		log.Printf("seed: failed to insert courses: %v", err)
		return
	}
	log.Printf("seed: inserted %d courses", len(courses))
}

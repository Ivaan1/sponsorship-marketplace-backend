import mongoose from 'mongoose'
import { faker, fakerES } from '@faker-js/faker'
import dotenv from 'dotenv'
import { eventsModel, usersModel } from '../../models/index.js'
import dbConnect from '../../config/mongo.js'

dotenv.config()

// ─── Constantes ───────────────────────────────────────────────────────────────

const categories = ['music', 'technology', 'gastronomy', 'culture', 'business', 'health', 'education', 'entertainment']
const sponsorshipLevels = ['title', 'gold', 'silver', 'bronze', 'community']
const eventStatuses = ['draft', 'published', 'cancelled', 'finished']
const locationTypes = ['venue', 'online', 'tba']

// ─── Nombres de eventos ────────────────────────────────────────────────────────

const eventPrefixes = {
    music: ['Festival', 'Concierto', 'Gala', 'Noche de', 'Sesión'],
    technology: ['Summit', 'Hackathon', 'Conferencia', 'Workshop', 'Demo Day'],
    gastronomy: ['Feria de', 'Mercado de', 'Cata de', 'Festival Gastronómico'],
    culture: ['Exposición', 'Feria Cultural', 'Encuentro de', 'Muestra de'],
    business: ['Forum', 'Networking', 'Investment Day', 'Business Summit'],
    health: ['Maratón', 'Torneo de', 'Carrera', 'Reto'],
    education: ['Taller de', 'Seminario de', 'Jornada de', 'Congreso de'],
    entertainment: ['Show de', 'Gala de', 'Espectáculo de', 'Noche de'],
}

const eventSuffixes = {
    music: ['Jazz', 'Rock Alternativo', 'Electrónica', 'Flamenco', 'Indie'],
    technology: ['IA & Machine Learning', 'Blockchain', 'Startups', 'Cloud', 'Ciberseguridad'],
    gastronomy: ['Vinos', 'Tapas', 'Cocina Mediterránea', 'Street Food', 'Quesos'],
    culture: ['Arte Contemporáneo', 'Fotografía', 'Cine', 'Literatura', 'Danza'],
    business: ['Inversión', 'Emprendimiento', 'Marketing Digital', 'Fintech'],
    health: ['Running', 'Yoga', 'Crossfit', 'Ciclismo', 'Natación'],
    education: ['Programación', 'Diseño UX', 'Liderazgo', 'Comunicación'],
    entertainment: ['Magia', 'Comedia', 'Improvisación', 'Circo'],
}

const generateEventName = (category) => {
    const prefix = fakerES.helpers.arrayElement(eventPrefixes[category] || eventPrefixes.entertainment)
    const suffix = fakerES.helpers.arrayElement(eventSuffixes[category] || eventSuffixes.entertainment)
    const year = new Date().getFullYear()
    return `${prefix} ${suffix} ${fakerES.helpers.maybe(() => year, { probability: 0.5 }) ?? ''}`.trim()
}

// ─── Generadores de sub-documentos ────────────────────────────────────────────

const generateMedia = (category) => ({
    images: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => ({
        url: faker.image.urlLoremFlickr({ category }),
        size: faker.number.int({ min: 1000, max: 5000 }),
        format: faker.helpers.arrayElement(['jpeg', 'png']),
    })),
    video: faker.helpers.maybe(() => ({
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        format: faker.helpers.arrayElement(['mp4', 'mov']),
        duration: faker.number.int({ min: 30, max: 600 }),
        resolution: faker.helpers.arrayElement(['720p', '1080p', '4K']),
    }), { probability: 0.6 }),
})

const generateAgendaDay = (baseDate) =>
    Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () => {
        const start = new Date(baseDate.getTime() + faker.number.int({ min: 0, max: 6 }) * 3600000)
        const end = new Date(start.getTime() + faker.number.int({ min: 1, max: 3 }) * 3600000)
        return {
            title: fakerES.helpers.arrayElement(['Bienvenida', 'Keynote', 'Networking', 'Panel', 'Taller', 'Cierre']),
            startTime: start,
            endTime: end,
            hostOrArtist: faker.person.fullName(),
            description: fakerES.lorem.sentence(),
        }
    })

const generateTickets = () =>
    Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => {
        const type = faker.helpers.arrayElement(['paid', 'free', 'donation'])
        return {
            name: faker.helpers.arrayElement(['General', 'VIP', 'Early Bird', 'Student', 'Premium']),
            type,
            price: type === 'paid' ? faker.number.int({ min: 10, max: 500 }) : 0,
            availableQuantity: faker.number.int({ min: 50, max: 2000 }),
            saleEnds: faker.helpers.maybe(() => ({
                reference: faker.helpers.arrayElement(['before_event', 'before_start']),
                amount: faker.number.int({ min: 1, max: 72 }),
                unit: faker.helpers.arrayElement(['minutes', 'hours', 'days']),
            }), { probability: 0.5 }),
            advanced: {
                description: fakerES.lorem.sentence(),
                visibility: faker.helpers.arrayElement(['public', 'hidden']),
                ticketsPerOrder: faker.number.int({ min: 1, max: 10 }),
                delivery: {
                    online: faker.datatype.boolean(),
                    door: faker.datatype.boolean(),
                },
                electronicTicket: faker.datatype.boolean(),
                inPersonPickup: faker.datatype.boolean(),
            },
        }
    })

const generateCast = () =>
    Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
        image: faker.image.avatar(),
        name: faker.person.fullName(),
        description: fakerES.lorem.sentence(),
        isHeadliner: faker.datatype.boolean(),
        socialLinks: {
            instagram: `https://instagram.com/${faker.internet.username()}`,
            twitter: `https://twitter.com/${faker.internet.username()}`,
            facebook: faker.helpers.maybe(() => `https://facebook.com/${faker.internet.username()}`, { probability: 0.5 }),
            website: faker.helpers.maybe(() => faker.internet.url(), { probability: 0.4 }),
        },
    }))

const generateSponsorship = (category) => ({
    isLookingForSponsors: true,
    category,
    budget: {
        min: faker.number.int({ min: 500, max: 5000 }),
        max: faker.number.int({ min: 5000, max: 50000 }),
    },
    targetAudience: {
        ageRange: {
            min: faker.number.int({ min: 18, max: 25 }),
            max: faker.number.int({ min: 26, max: 65 }),
        },
        interests: faker.helpers.arrayElements(
            ['tech', 'music', 'sports', 'food', 'art', 'blockchain', 'startups', 'wellness'],
            faker.number.int({ min: 2, max: 4 })
        ),
        expectedAttendees: faker.number.int({ min: 100, max: 10000 }),
    },
    perks: faker.helpers.arrayElements([
        'Logo en escenario',
        'Mención en redes sociales',
        'Stand propio',
        'Acceso VIP',
        'Banner en web',
        'Mención en newsletter',
        'Entradas gratuitas',
        'Entrevista en streaming',
    ], faker.number.int({ min: 2, max: 5 })),
    sponsorshipLevel: faker.helpers.arrayElement(sponsorshipLevels),
    digitalReach: {
        estimatedOnlineViewers: faker.number.int({ min: 1000, max: 100000 }),
        streamingPlatforms: faker.helpers.arrayElements(['YouTube', 'Twitch', 'Instagram Live', 'TikTok Live'], 2),
        socialMediaImpressions: faker.number.int({ min: 5000, max: 500000 }),
        hasLivestream: faker.datatype.boolean(),
    },
    previousSponsors: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => ({
        name: faker.company.name(),
        logoUrl: faker.image.urlLoremFlickr({ category: 'business' }),
        year: faker.helpers.arrayElement([2022, 2023, 2024]),
    })),
    sponsorshipStatus: faker.helpers.arrayElement(['open', 'closed', 'in_negotiation']),
    sponsorsApplied: Array.from({ length: faker.number.int({ min: 0, max: 4 }) }, () => ({
        sponsor: new mongoose.Types.ObjectId(),
        status: faker.helpers.arrayElement(['pending', 'accepted', 'rejected']),
        message: fakerES.lorem.sentence(),
        appliedAt: faker.date.recent({ days: 60 }),
    })),
    collaborationTypes: faker.helpers.arrayElements(["financial", "services", "brand_collaboration"], 2),
    pitch: fakerES.lorem.paragraph(),
    socialLinks: {
        whatsapp: faker.phone.number(),
        instagram: `https://instagram.com/${faker.internet.username()}`,
    },
    
    sponsorshipLevel: faker.helpers.arrayElement(sponsorshipLevels),
    sponsorshipStatus: 'open',
    sponsorsApplied: []
})

// ─── Generador principal de evento ────────────────────────────────────────────

const generateEvent = (organizerId) => {
    const category = faker.helpers.arrayElement(categories)
    const eventType = faker.helpers.arrayElement(['single', 'recurring'])
    const locType = faker.helpers.arrayElement(locationTypes)

    const startTime = faker.date.future({ years: 1 })
    const endTime = new Date(startTime.getTime() + faker.number.int({ min: 1, max: 8 }) * 3600000)

    // Agenda: array de arrays (un array por día/sesión)
    const agendaDays = Array.from(
        { length: faker.number.int({ min: 1, max: 3 }) },
        (_, i) => {
            const dayBase = new Date(startTime.getTime() + i * 86400000)
            return generateAgendaDay(dayBase)
        }
    )

    return {
        organizer: new mongoose.Types.ObjectId(organizerId),

        name: generateEventName(category),
        summary: fakerES.lorem.sentence({ min: 5, max: 20 }).slice(0, 140),
        introduction: fakerES.lorem.paragraphs(2),

        media: generateMedia(category),

        eventType,

        singleDate: eventType === 'single' ? { startTime, endTime } : undefined,

        recurrence: eventType === 'recurring' ? {
            frequency: faker.helpers.arrayElement(['daily', 'weekly', 'monthly']),
            until: faker.date.future({ years: 1 }),
            dayOfWeek: faker.helpers.maybe(() =>
                faker.helpers.arrayElement(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
                { probability: 0.5 }
            ),
            dayOfMonth: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 28 }), { probability: 0.3 }),
            schedules: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => {
                const s = faker.date.future({ years: 1 })
                const e = new Date(s.getTime() + faker.number.int({ min: 1, max: 6 }) * 3600000)
                return { startTime: s, endTime: e }
            }),
        } : undefined,

        location: {
            type: locType,
            venue: locType === 'venue' ? {
                name: faker.company.name(),
                address1: faker.location.streetAddress(),
                address2: faker.helpers.maybe(() => faker.location.secondaryAddress(), { probability: 0.3 }),
                city: faker.location.city(),
                state: faker.location.state(),
                zipCode: faker.location.zipCode(),
                country: faker.location.country(),
            } : undefined,
            onlineUrl: locType === 'online' ? faker.internet.url() : undefined,
        },

        usefulInfo: {
            highlights: {
                ageRestriction: faker.helpers.arrayElement([
                    'all_ages', '+12', '+16', '+18', '+21',
                    'guardian_under_14', 'guardian_under_16', 'guardian_under_18', 'guardian_under_21'
                ]),
                parking: faker.helpers.arrayElement(['free', 'paid', 'none']),
            },
            faq: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
                question: fakerES.lorem.sentence() + '?',
                answer: fakerES.lorem.sentences(2),
            })),
        },

        cast: generateCast(),

        agenda: agendaDays,

        tickets: generateTickets(),

        sponsorship: generateSponsorship(category),

        status: faker.helpers.arrayElement(eventStatuses),
    }
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

const seed = async () => {
    await dbConnect()

    await eventsModel.deleteMany()
    console.log('🗑️  Eventos anteriores eliminados')
    

    // ⚠️ Reemplaza este ID por un ObjectId real de tu colección de usuarios
    const fakeOrganizerId = '69ebc5b72d24438dba8ccffc'

    const events = Array.from({ length: 50 }, () => generateEvent(fakeOrganizerId))
    await eventsModel.insertMany(events)

    console.log('✅ 50 eventos creados correctamente')
    process.exit(0)
}

seed().catch((err) => {
    console.error('❌ Error en el seed:', err)
    process.exit(1)
})
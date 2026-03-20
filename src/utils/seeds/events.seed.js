const mongoose = require('mongoose')
const { faker, fakerES } = require('@faker-js/faker')
require('dotenv').config()

const { eventsModel } = require('../../models')
const dbConnect = require('../../config/mongo')

const categories = ['music', 'technology', 'gastronomy', 'culture', 'business', 'health', 'education', 'entertainment']
const sponsorshipLevels = ['title', 'gold', 'silver', 'bronze', 'community']
const eventStatuses = ['draft', 'published', 'cancelled', 'finished']
const locationType = ['venue', 'online', 'tba']

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

    // Ej: "Festival de Jazz 2026" o "Hackathon IA & Machine Learning"
    return `${prefix} ${suffix} ${fakerES.helpers.maybe(() => year, { probability: 0.5 }) ?? ''}`
        .trim()
}

const generateEvent = (organizerId) => {
    const startTime = faker.date.future()
    const endTime = new Date(startTime.getTime() + faker.number.int({ min: 1, max: 8 }) * 3600000)
    const type = faker.helpers.arrayElement(locationType)
    const eventType = faker.helpers.arrayElement(['single', 'recurring'])
    const category = faker.helpers.arrayElement(categories)

    return {
        organizer: organizerId,

        name: generateEventName(category),
        summary: fakerES.lorem.sentence({ min: 5, max: 20 }).slice(0, 140),
        introduction: fakerES.lorem.paragraphs(2),

        eventType,

        singleDate: eventType === 'single' ? {
            startTime,
            endTime,
        } : undefined,

        recurrence: eventType === 'recurring' ? {
            frequency: faker.helpers.arrayElement(['daily', 'weekly', 'monthly']),
            until: faker.date.future({ years: 1 }),
            schedules: [{
                startTime,
                endTime,
            }]
        } : undefined,

        location: {
            type,
            venue: type === 'venue' ? {
                name: faker.company.name(),
                address1: faker.location.streetAddress(),
                city: faker.location.city(),
                state: faker.location.state(),
                zipCode: faker.location.zipCode(),
                country: faker.location.country(),
            } : undefined,
            onlineUrl: type === 'online' ? faker.internet.url() : undefined,
        },

        usefulInfo: {
            highlights: {
                ageRestriction: faker.helpers.arrayElement(['all_ages', '+12', '+16', '+18', '+21']),
                parking: faker.helpers.arrayElement(['free', 'paid', 'none']),
            },
            faq: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => ({
                question: faker.lorem.sentence() + '?',
                answer: faker.lorem.sentences(2),
            })),
        },

        cast: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
            name: faker.person.fullName(),
            description: faker.lorem.sentence(),
            isHeadliner: faker.datatype.boolean(),
            socialLinks: {
                instagram: `https://instagram.com/${faker.internet.username()}`,
                twitter: `https://twitter.com/${faker.internet.username()}`,
            }
        })),

        tickets: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => {
            const type = faker.helpers.arrayElement(['paid', 'free', 'donation'])
            return {
                name: faker.helpers.arrayElement(['General', 'VIP', 'Early Bird', 'Student']),
                type,
                price: type === 'paid' ? faker.number.int({ min: 10, max: 500 }) : 0,
                availableQuantity: faker.number.int({ min: 50, max: 1000 }),
            }
        }),

        sponsorship: {
            isLookingForSponsors: faker.datatype.boolean(),
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
                interests: faker.helpers.arrayElements(['tech', 'music', 'sports', 'food', 'art', 'blockchain', 'startups'], 3),
                expectedAttendees: faker.number.int({ min: 100, max: 10000 }),
            },
            perks: faker.helpers.arrayElements([
                'Logo en escenario',
                'Mención en redes sociales',
                'Stand propio',
                'Acceso VIP',
                'Banner en web',
                'Mención en newsletter',
            ], faker.number.int({ min: 2, max: 4 })),
            sponsorshipLevel: faker.helpers.arrayElement(sponsorshipLevels),
            digitalReach: {
                estimatedOnlineViewers: faker.number.int({ min: 1000, max: 100000 }),
                streamingPlatforms: faker.helpers.arrayElements(['YouTube', 'Twitch', 'Instagram Live'], 2),
                socialMediaImpressions: faker.number.int({ min: 5000, max: 500000 }),
                hasLivestream: faker.datatype.boolean(),
            },
            sponsorshipStatus: faker.helpers.arrayElement(['open', 'closed', 'in_negotiation']),
        },

        status: faker.helpers.arrayElement(eventStatuses),
    }
}

const seed = async () => {
    await dbConnect()

    // Limpia los eventos existentes
    await eventsModel.deleteMany()
    console.log('🗑️  Eventos anteriores eliminados')

    // Usa un ObjectId fake de organizador — cámbialo por uno real de tu BD
    const fakeOrganizerId = '69bc67682b5d11db7ebfe70b'

    const events = Array.from({ length: 50 }, () => generateEvent(fakeOrganizerId))
    await eventsModel.insertMany(events)

    console.log('✅ 50 eventos creados correctamente')
    process.exit(0)
}

seed().catch((err) => {
    console.error('❌ Error en el seed:', err)
    process.exit(1)
})
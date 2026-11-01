// The site's data, carried over unchanged from the Jekyll site's `_data/` directory.
// Each JSON file is the single source for its page; this module only gives it a type.

import albumsJson from '@/content/data/albums.json'
import bioJson from '@/content/data/bio.json'
import friendsJson from '@/content/data/friends.json'
import navigationJson from '@/content/data/navigation.json'
import photosJson from '@/content/data/photos.json'
import showsJson from '@/content/data/shows.json'
import siteJson from '@/content/data/site.json'
import videosJson from '@/content/data/videos.json'

export type Social = Record<
  | 'spotify'
  | 'apple_music'
  | 'youtube'
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'tiktok'
  | 'tidal'
  | 'amazon_music'
  | 'bandcamp',
  string
>

export interface SiteData {
  title: string
  tagline: string
  hero_image: string
  mailchimp_form_action: string
  social: Social
}

export interface NavItem {
  name: string
  url: string
}

export interface Track {
  title: string
  duration: string
}

export interface Album {
  title: string
  artist: string
  artwork: string
  year: number
  bandcamp_embed: string
  spotify_embed: string
  youtube_embed?: string
  post_url?: string
  tracks: Track[]
}

export interface ExternalLink {
  type: string
  url: string
  label: string
}

export interface Member {
  name: string
  slug: string
  role: string
  photo: string
  photo_dog?: string
  bio_silly: string
  bio_serious: string
  /** Read by the member page, as the Jekyll layout did; no member sets it yet. */
  bio?: string
  links?: ExternalLink[]
}

export interface Bio {
  title: string
  image: string
  content: string
  members: Member[]
}

export interface Photo {
  src: string
  alt: string
  caption: string
}

export interface Video {
  title: string
  youtube_id: string
  description: string
}

export interface Friend {
  name: string
  url: string
  image: string
  description: string
  links: ExternalLink[]
}

export interface Show {
  date: string
  venue: string
  city: string
  details?: string
  ticket_url?: string
}

export interface Shows {
  upcoming: Show[]
  past: Show[]
}

/** The canonical origin, which every absolute URL (canonical, og:url, sitemap) is built on. */
export const SITE_URL = 'https://scratchyfish.com'

/** `_config.yml`'s `description`: the default meta description for every page. */
export const SITE_DESCRIPTION =
  'Scratchy Fish is a progressive jazz rock band from San Jose, California. Listen to our music, see upcoming shows, and connect with us.'

export const site: SiteData = siteJson
export const navigation: NavItem[] = navigationJson
export const albums: Album[] = albumsJson
export const bio: Bio = bioJson
export const photos: Photo[] = photosJson
export const videos: Video[] = videosJson
export const friends: Friend[] = friendsJson
export const shows: Shows = showsJson

export function memberBySlug(slug: string): Member | undefined {
  return bio.members.find((member) => member.slug === slug)
}

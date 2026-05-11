
export const notifications = [
  {
    id: 1,
    title: "Access request from Bank HQ",
    role: "System",
    desc: "A new access request for your passport document has been received.",
    avatar: undefined,
    status: "online",
    unreadmessage: false,
    date: "2 mins ago",
  },
  {
    id: 2,
    title: "Verification Successful",
    role: "Identity Provider",
    desc: "Your national ID has been successfully verified by the government portal.",
    avatar: undefined,
    status: "online",
    unreadmessage: true,
    date: "1 hour ago",
  },
];

export const messages = [
  {
    title: "Support Team",
    desc: "Hello, we noticed a minor issue with your document upload...",
    active: true,
    hasnotifaction: true,
    notification_count: 1,
    image: undefined,
    link: "#",
  },
];

export type Message  = ( typeof messages) [number]
export type Notification =  (typeof notifications) [number]

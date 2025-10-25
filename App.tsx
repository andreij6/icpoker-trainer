
import React, { useState } from 'react';
import Header from './components/Header';
import AIAssistant from './components/AIAssistant';
import PlayingCard from './components/PlayingCard';
import PlayerComponent from './components/Player';
import ActionControls from './components/ActionControls';
import { GameState, Suit, PlayerStatus, ChatMessage, Player } from './types';
import { getAICoachSuggestion } from './services/geminiService';

const initialGameState: GameState = {
  pot: 1250,
  communityCards: [
    { suit: Suit.Spades, rank: 'A', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJ8ajyRIG7Y_cl9Yo0TgNx86r5-Oyg23QmOPTTnVSbruwLZDxpHA7mJVxuGafxcOr_nH_XbRqcYsRrwrkgrL2h7x5MjutmXhlWVSC_MdQqPFmxR5EdHavj3JpNnm4xyawSXDgEmc649PKDGBpSZpNEsoGVvJdftR_OB9IhOEWgfVn0v2JuUzWHkqafX45bYji-CT-EU_HHRPNL4FXQGMwxho0A08GuwsCjvreDs06ZZJou-viJgwQaiEBKBVtsqqjdxQu7mGHvhF0' },
    { suit: Suit.Spades, rank: 'K', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdWscIvquLR2yWZREmVOBvVfq3UXXvowUyJiFO9BO74RQ1GowD9P3l5XCbQnOn6ERzl9acVik42wzWV1kzj3nbCID1Gauxcx8l9eD7f35UbeaN9EqEr20mrfRtiBjiuQpHbXF-UT5fkBXAGMAcm_bVsbGsQiceLNrz9Y-L4Mv4oLgR1t-kQW3ark-RtvoZRErVswHqzic-XXcDdx3zq_RPdMab4SYpPHyNpLmvbrGiF-h7pQQ-DSUG-qMelmhCYT9VDzwNkaAF864' },
    { suit: Suit.Spades, rank: 'Q', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxBFdeIa5n-2cz_6DjaN76j68aIYiOm-uy130agJsxXVAtjPd6syjz-FBxEhKSf8OaHtrYOICXogOebOF4qUpE3hTSJDM-t7r0gVSTNiiAjiIvKkmSPgZ6CuorrJWMKzdIf4_LaCRLivFw_xglcHTmnFEubtooHiXa3eq-pNXDW_TqIulwfvaScf1CzA19Zyg0zcM3acsNjoaYSHnDLxXodNXjWgxDPXPD79e1-3FhRtRGS0ZKRKW9xbn0Yjb4LDZ1Mchysl5OhNc' },
    { suit: Suit.Spades, rank: 'J', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcD3veEzEyH_egWipXd9U9QQGSgo0lLInGBqkIPJ-AuJiXHFyYaGcS7FiawgnAU37yrIO2Ke1YUG9JdYHwTI0qGWVDl8npUFmwdzFl_ThksdYTBqUDoXgo1SCYNM8mpH9HWN6_rqQPisHa7vSiTDQvZFxZUp1V1AAV0YccgZODQ9Y5AA3R0UPpTODjj9VtWnMrTVoFHclvyR-BLeIevZKdA74MQtpzCHQiQ-ayBm5VxyFCAdFv22s_TbHUjeafYExM8aWhvQdos28' },
    { suit: Suit.Spades, rank: '10', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxbbeBFIsEEqJSKKXDgmeFoii68TCPqfVaSOH0VbS8K6EaykBjQssl4BBWsVN529fEPuzBYca4KSAm-TQlMk26LOI0FmDon_CevaVrQeQ1q-5KfO672Ku2P25KzgmOhpGNT0wI1Z-ESD957OsTpxDbWSUVEXIx2WB9FQceIAC2E2AdfbWkuVTTHG2f3-iGbweJFY8VNsWDf160SdmlDMOidI6mZwc34oXiXBq4FmEKWI22DfqXIfhYdJIWcDO8-o3yx_-BUWHrp3E' },
  ],
  players: [
    { id: 1, name: 'Player 1', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6jgn_R83bO5C-8OmPM1ETWkVFUYBN-Jilqracx-8LncM5wk_PX7IYCQjrOdSkbi2ypcide3l90FT1A_ZW-eCdA-SgFv5kwZ0E0o54ZiKFZNK1ekXXyd-vGMvSoc4_ru9ypSZlVU1UjKQsxQbCo5frQDN9D_x5Ob0iC-e9oNvj6jQVPZltYStphdttmWmIVSZYj7Q3EopPN1p-tXAc4yXnoTtq5unXta52Or2QbCRth3xtv9UcwYuJL7dgbo50-bpYeQ0EBM7o3WM', stack: 1500, status: PlayerStatus.Active },
    { id: 2, name: 'Player 2', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1hirWH3MXb6BPZ64Zl3F155Xwy0Qs2GrVTiqKb8XShY9rDTX_7MSsZV6FEMUYMn-unlfadADnSgaSJXwJjfyv-vhMM-BcwrqQyXQmUoDhnCjKtmth7_Eczz95ShYhFk2Welm4CdxPMDWA4Qj8wQ691kAsK1zmk9eh310MYU3F0NSPPkvK3H3ogpsucswQ375I6HjPbU_u9Lw4NNiTAzIc2GwWcXpCLEoMfHC6FOHFb8evare3PuHDUgoqt92rryqStzdm6cTSBoE', stack: 0, status: PlayerStatus.Folded },
    { id: 3, name: 'Player 3', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnmZywfuWOWmlHmh13bVdo0VOL3CYiocxLGI-b2zce4c-beg2BNwgAcuyF4zj_YH5yLh9jyj64UZWn3M0NlLTasyBu3pm3wA2_Jjp0zXvXdDBnyj56SwZ6ib2de6TXwE6-kxvJKQmgc0QmP2wQH4KtoJS1Rlqhyx15RpohOpQjaFspaECkXtTD-h771X0Fus3dpueztqs-lU1ipsKwX5dEjP-C0W2RjV4O2nXDvnVw8fojdeLztgeWKzxAWXEP-bSvyNnqa56LtLY', stack: 1950, status: PlayerStatus.Active, isDealer: true },
    { id: 4, name: 'Player 4', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0k7k10MlIDLtwSohWAZaeW8U11tBXnLfMZMvbgCSl2Yg6joGJqHtDEBc3_vTkkp4EMn-GnkVuqlSpizEunlvXBgg4o-PfCMO_8q8OmbJfT2rH5jeIlEwwJOHLPgbtCCUWRUBxAmQkfXXow2rrwDSIRflnd2Gs63IGDkcZHxMV6Abnsr9t7RBcBoUXIuwLSp09SfstMno57tIJyulW4iJC1gw8Yeh31XXD6twU3uZzyMObTunNEF5rj_qNvz8u18UvNEAfbpDWhwM', stack: 0, status: PlayerStatus.Folded },
    {
      id: 5, name: 'You', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSzgZHwJmTJFdksNDZBIjUlK0YMdetyjzxdnbBkshl6jsJlTQcpneFwyLXSFIZVBCJFJ-EGS6JzvV41_z22QySqZUt5MP1EFca4tjEEY96rTvS3f3sfyUWr8sri50dmwi4Di3p_pEU_UoqA0uKV87_SiIujZ7xMQrIyC3gtsFWiTYFBrE53glgvKCI3poBcKhhi44Fmvo8pEy8EfG0gFckwQgiz-KMwtNFd5Y3nDZkk8lOUc_yfuP1AUX1pINCI6vR4YZa_g47v34', stack: 2500, status: PlayerStatus.Active, isYou: true,
      cards: [
          { suit: Suit.Hearts, rank: 'A', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7zY0M2LWj700VWgt0AownZePtUQGs_cR18KV_BMeYIr50c5PCAnuTkpkKlWRjT2xkLDeAEYqa_4kIHDlmMfxLPsyoZ0Xzz3q2jREfMZArSIgM--CXnHYN2opqEassQrQWiWWfqmC2mDZaypjIn5BA7s7FraGobRp-6rHck9Ad5X6TbNhuPv9vaHUZJPojJRT8JAWleMfk3D-85XxCiu5C-Rqz0xpe_iDkefTSC0cLmmoWtY-2QsNvx8BP6EFPzjyRTd6Ngzg7CwM' }, 
          { suit: Suit.Hearts, rank: 'K', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXUKWTQdSfYEt9lbDf-CJ0mKJvLSba3YuRkGNvGaOKHtEvnbXf4kuBKth1FngeE_s5H9Qh8CaFyt-E_AvkEFcMWs8schhzNbnv7qfvKp-RDJiIqLwvOVYPyF1IVQ4pAxTwikO69GElkPBDpftox_ID_TB97AUYg0PYP-05zwcxIG7jxaK4DNH2Ourjn67xtnFkDPhenZ_DN_u_AtWYYShY363mAc6_0Cigo_z5NZcOSg9fixV-U3dgLBxyHarKSesUBdPxTqU-FCY' }
        ] as const,
    },
    { id: 6, name: 'Player 5', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-Um___56GcCCGRFkv-3o6hyfqFK6oi8xBWz8tM-uQiNFWQpOfHMN6RvhFlygReBb3YqtnHZNukbBhA0fPTWwC7qbc1STiDyYrblg-yCe54rMA_mhAP9wgYOW9_75mIncFMEx4KN3HVaP8UaemMkKdgtVLp_p570JdAJ1WFgjLqxC7jilxW7rfSzFemSP3onBzUWePvecfLpB5VKCtvmOfRve4PncN8oJ68Rzpd1fkWoPgYzgFVb2tBtYx8Ewj9wWR3FHSDHWuL1Q', stack: 2200, status: PlayerStatus.Active },
    { id: 7, name: 'Player 6', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRuIHxVi2t8g-M7nZFVCn1aNgiE0TLKwfNBXgidJpiWhP7RZ1VJ6PFLsDx8IJGUeoqxSkgnR0iGe2FLa5V4ZTXhIakepgF8_TFAYQDAM_ElhlraQo21k7oq2o4rbY40cdBWw_4fMx3ffXk7ULQ5hnqbovXCOsEdX-t2y_MOKV0QeelGBz857XvdvDdKfLmwVBNAr0y7xTSuTEvF2Yx6OGvqPCqMI9hxqpNZkeXkaaAGXUCINmus-z7Rkwv7kCAHRK8jDqjmidrzdQ', stack: 0, status: PlayerStatus.Folded },
    { id: 8, name: 'Player 8', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQKmxLQQOsGefcqF6I_U6v1DFiiElT1QVYD4yE4mGvjY0Ow4HMQeLvXYvRz6QACsjXjnzApHOyzWRPKnpkFI31quZubzGY3D6C8QLZGmupBc46QYekJYFBVyMI7ev9ucm3IcBNmf3dEfuAHn5O8_yLYWxQsrM9LIWn2fXM-V8H86fd_97am8Xu-JiMXXw6fx9ajXhZSU9sPkrkmguM0_LeXfLzHFz3acFknYv8GENhISv7QZiVWUGIpx-eEBmDEKENq2xeNCh5rDU', stack: 950, status: PlayerStatus.Active },
  ],
};

/**
 * A component that displays the community cards (flop, turn, and river) and the pot size.
 *
 * @param {object} props The props for the component.
 * @param {GameState['communityCards']} props.cards The array of community cards.
 * @param {number} props.pot The current size of the pot.
 */
const CommunityCards = ({ cards, pot }: { cards: GameState['communityCards'], pot: number }) => {
    const flop = cards.slice(0, 3);
    const turn = cards.slice(3, 4);
    const river = cards.slice(4, 5);
    return (
        <div className="flex flex-col items-center gap-4">
            <p className="text-white text-xl font-bold leading-normal">Pot: ${pot.toLocaleString()}</p>
            <div className="flex items-start gap-8">
                <div className="flex flex-col items-center gap-2">
                    <p className="text-white/60 text-sm font-bold">FLOP</p>
                    <div className="flex gap-2">
                        {flop.map((card, i) => <PlayingCard key={i} card={card} isFaceUp={true} size="xl" />)}
                    </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <p className="text-white/60 text-sm font-bold">TURN</p>
                    <div className="flex gap-2">
                        {turn.map((card, i) => <PlayingCard key={i} card={card} isFaceUp={true} size="xl" />)}
                    </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <p className="text-white/60 text-sm font-bold">RIVER</p>
                    <div className="flex gap-2">
                         {river.map((card, i) => <PlayingCard key={i} card={card} isFaceUp={true} size="xl" />)}
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * The main application component.
 *
 * This component orchestrates the entire application, managing the game state,
 * handling user interactions, and rendering all the major UI components.
 */
function App() {
  const [gameState] = useState<GameState>(initialGameState);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      author: 'AI',
      text: 'You have a strong hand with a full house. Considering the board texture, your hand is likely the best. The optimal play is to bet for value to maximize your winnings. How much would you like to bet?'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message: string) => {
    setMessages(prev => [...prev, { author: 'User', text: message }]);
    setIsLoading(true);
    try {
      const aiResponse = await getAICoachSuggestion(gameState, message);
      setMessages(prev => [...prev, { author: 'AI', text: aiResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { author: 'AI', text: 'There was an error connecting to the AI coach.' }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const userIndex = gameState.players.findIndex(p => p.isYou);
  const userPlayer = userIndex !== -1 ? gameState.players[userIndex] : null;

  // Arrange other players relative to the user's position for display.
  // This assumes the initial array order represents the seat order.
  const otherPlayersInOrder = userIndex !== -1 ? [
    ...gameState.players.slice(userIndex + 1),
    ...gameState.players.slice(0, userIndex)
  ] : gameState.players.filter(p => !p.isYou);
  
  const midPoint = Math.ceil(otherPlayersInOrder.length / 2);
  const leftPlayers = otherPlayersInOrder.slice(0, midPoint);
  const rightPlayers = otherPlayersInOrder.slice(midPoint);


  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden">
        <Header />
        <main className="flex-1 flex flex-col items-center p-6 bg-[#062918]">
            <div className="w-full max-w-7xl mx-auto flex flex-col justify-center items-center gap-8">
                <CommunityCards cards={gameState.communityCards} pot={gameState.pot} />
                <AIAssistant messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />
            </div>

            <div className="flex-1 w-full flex items-center justify-center">
                {userPlayer && (
                    <ActionControls 
                        pot={gameState.pot}
                        playerStack={userPlayer.stack}
                        toCall={100} // Example: there is a bet of 100 to call
                    />
                )}
            </div>

            <div className="w-full pb-6">
                <div className="flex justify-center items-end gap-4">
                    {leftPlayers.map(player => <PlayerComponent key={player.id} player={player} />)}
                    
                    {userPlayer && (
                        <div className="flex flex-col items-center text-center mx-8">
                            <div className="flex items-center gap-2 mb-2 h-44 relative">
                                {userPlayer.cards && <>
                                    <PlayingCard card={userPlayer.cards[0]} isFaceUp={true} size="large" className="-rotate-6 transform hover:scale-110 transition-transform" />
                                    <PlayingCard card={userPlayer.cards[1]} isFaceUp={true} size="large" className="rotate-6 transform hover:scale-110 transition-transform" />
                                </>}
                            </div>
                            <div 
                               className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-20 border-4 border-primary"
                               style={{backgroundImage: `url("${userPlayer.avatarUrl}")`}}
                            ></div>
                            <span className="text-white font-bold mt-2 text-base">You</span>
                            <span className="text-primary font-semibold text-base">${userPlayer.stack.toLocaleString()}</span>
                        </div>
                    )}

                    {rightPlayers.map(player => <PlayerComponent key={player.id} player={player} />)}
                </div>
            </div>
        </main>
    </div>
  );
}

export default App;

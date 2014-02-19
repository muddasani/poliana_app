require 'sunspot_mongoid2'

class Politician
  include Mongoid::Document

  field :first_name, :type => String
  field :last_name, :type => String
  field :party, :type => String
  field :district, :type => Integer
  field :birthday, :type => Date
  field :bioguide_id, :type => String

  embeds_many :terms

  index "terms.term_start" => 1
  index :bioguide_id => 1

  include Sunspot::Mongoid2
  searchable do
    text :first_name
    text :last_name
    text :party
  end

  def self.boosted_search(page, query)
    
    self.search do 
       fulltext query do
        boost_fields :last_name => 3.0
        boost_fields :first_name => 2.5
        boost_fields :party => 2.0
      end

      paginate :page => page, :per_page => 10
      order_by(:score, :desc)
    end
  end
end
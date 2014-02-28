@start_date = Date.new(2003, 1, 1)

def import_raw_legislators_to_mongo
  
  json = File.read('lib/assets/legislators.json')
  legislators = JSON.parse(json)

  legislators.each do |pol|

    if pol["bioguide_id"] == nil
      puts "bioguide nil: " + pol["first_name"] + " " + pol["last_name"] 
      next
    end

    term_start = DateTime.strptime((pol["begin_timestamp"]).to_s, '%s').to_date
    term_end = DateTime.strptime((pol["end_timestamp"]).to_s, '%s').to_date

    term_type = pol["term_type"]

    # incorrect term end senate fix
    if term_end < @start_date && term_type == "sen" && term_start + 6.years <= Date.today
      puts "incorrect term end senate: " + pol["first_name"] + " " + pol["last_name"] + ", end: " + term_end.to_s
      term_end = term_start + 6.years
    end

    # incorrect term end house fix
    if term_end < @start_date && term_type == "rep" && term_start + 2.years <= Date.today
      puts "incorrect term end house: " + pol["first_name"] + " " + pol["last_name"] + ", end: " + term_end.to_s
      term_end = term_start + 2.years
    end

    # elected within term limit fix
    if term_end < @start_date
      puts "elected within term limit: " + pol["first_name"] + " " + pol["last_name"] + ", elected on: " + term_start.to_s
      term_end = Date.today
    end

    # skip the term if it ends before the start date
    if term_end < @start_date
      next
    end

    # HACK
    # when term type is senate and term end is within 6 years of start date, we need to hack the term_start to be the start_date
    # so that we correctly label that term and the valid congress numbers that should be displayed on the front end
    if term_type == "sen" && term_end < @start_date + 7.years
      term_start = @start_date + 2.days
    end
      

    mpol = Politician.where(:bioguide_id => pol["bioguide_id"])[0]

    if !mpol
      mpol = Politician.new()
      mpol.bioguide_id = pol["bioguide_id"]
    end

    mpol.first_name ||= pol["first_name"]
    mpol.last_name ||= pol["last_name"]
    
    mpol.party ||= pol["party"]
    mpol.district ||= pol["district"]

    mpol.birthday ||= Date.strptime(pol["birthday"], "%Y-%m-%d") if pol["birthday"]

    mpol.gender =  pol["gender"] if pol["gender"]
    mpol.religion =  pol["religion"] if pol["religion"]

    mpol.state ||= pol["term_state"]

    term = Term.new()
    term.term_type = term_type
    term.start = term_start
    term.end = term_end

    mpol.terms << term

    mpol.save()
  end

  add_birthday_stats
  add_pre_election_terms
  add_congresses
end

def add_congresses
  
  Politician.all.each do |pol|

    pol.terms.each do |term|

      term.congresses = []
      i = term.start

      while(i < (term.end - 1.month))
        cong_num = (i.year - 1787) / 2
        # HACK: Remove 114 congress since we don't have data on that
        term.congresses <<  cong_num if (cong_num != 114)
        i += 1.year
      end

      term.congresses.uniq!
    end

    pol.save()
  end
end

def add_birthday_stats
  count = Politician.count.to_f
  Politician.order_by([:birthday, :asc]).each_with_index do |pol, i|
    fi = i.to_f

    calc = ((fi+1.0)/count)
    pol.percent_age_difference = (calc*100).to_i
    puts pol.percent_age_difference
  end
end

def add_pre_election_terms
  Politician.all.each do |pol|

    first_term = pol.terms.sort_by { |t| t.start }[0]

    pre_election_term_start = first_term.start - 2.years - 1.day

    if pre_election_term_start < @start_date
      next
    else
      pre_election_term = Term.new()

      pre_election_term.start = pre_election_term_start
      pre_election_term.end = pre_election_term_start + 2.years

      pol.terms << pre_election_term
      pol.save()
    end
  end
end

# RUN THE CODE

import_raw_legislators_to_mongo()
